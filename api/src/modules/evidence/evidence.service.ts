import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common"
import { EvidenceItem, Escrow } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service"
import type { AuthPayload } from "../auth/types/auth-payload"
import { formatEscrowId, parseEscrowId } from "../../utils/escrow-id.util"
import { ConfigService } from "@nestjs/config"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import type { EvidenceEntry } from "./types/evidence-entry"
import { NotificationsService } from "../notifications/notifications.service"
import { ethers } from "ethers"
import { randomUUID } from "node:crypto"
import { EvidencePresignDto } from "./dto/evidence-presign.dto"
import { EvidenceCommitDto } from "./dto/evidence-commit.dto"

@Injectable()
export class EvidenceService {
  private readonly s3Client: S3Client
  private readonly bucket: string
  private readonly endpoint: string
  private readonly presignExpiry: number

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly notifications: NotificationsService
  ) {
    const endpoint = this.configService.get<string>("MINIO_ENDPOINT")
    const accessKey = this.configService.get<string>("MINIO_ACCESS_KEY")
    const secretKey = this.configService.get<string>("MINIO_SECRET_KEY")
    const region = this.configService.get<string>("MINIO_REGION", "us-east-1")
    const bucket = this.configService.get<string>("MINIO_BUCKET")

    if (!endpoint || !accessKey || !secretKey || !bucket) {
      throw new Error("missing MinIO configuration")
    }

    this.bucket = bucket
    this.endpoint = endpoint.replace(/\/$/, "")
    this.presignExpiry = Number(
      this.configService.get("EVIDENCE_PRESIGN_TTL_SECONDS") ?? 900
    )

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    })
  }

  async presign(escrowId: string, payload: EvidencePresignDto, caller: AuthPayload) {
    const escrow = await this.ensureEscrow(parseEscrowId(escrowId))
    this.ensureAccess(escrow, caller)

    const key = this.buildObjectKey(escrowId, payload.filename)

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: payload.mime,
      ContentLength: Number(payload.size),
      Metadata: {
        sha256: payload.sha256,
        uploader: this.normalizeAddress(caller.address),
      },
    })

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.presignExpiry,
    })

    return {
      uploadUrl,
      key,
      uri: this.buildUri(key),
      expiresAt: new Date(Date.now() + this.presignExpiry * 1000).toISOString(),
    }
  }

  async commit(escrowId: string, payload: EvidenceCommitDto, caller: AuthPayload) {
    const escrow = await this.ensureEscrow(parseEscrowId(escrowId))
    this.ensureAccess(escrow, caller)

    const normalized = this.normalizeAddress(caller.address)

    const uri = payload.uri ?? this.buildUri(payload.key)

    const record = await this.prisma.evidenceItem.create({
      data: {
        escrowId: escrow.escrowId,
        uploader: normalized,
        uri,
        sha256: payload.sha256,
        mime: payload.mime,
        size: BigInt(payload.size),
        description: payload.description,
      },
    })

    await this.notifications.queueEvent({
      type: "escrow/evidence",
      escrowId,
      sender: normalized,
      payload: {
        uri,
      },
    })

    return this.mapRecord(record)
  }

  async list(escrowId: string, caller: AuthPayload) {
    const escrow = await this.ensureEscrow(parseEscrowId(escrowId))
    this.ensureAccess(escrow, caller)

    const items = await this.prisma.evidenceItem.findMany({
      where: { escrowId: escrow.escrowId },
      orderBy: { createdAt: "desc" },
    })

    return items.map((item) => this.mapRecord(item))
  }

  private mapRecord(record: EvidenceItem): EvidenceEntry {
    return {
      id: record.id,
      escrowId: formatEscrowId(record.escrowId),
      uploader: record.uploader,
      uri: record.uri,
      sha256: record.sha256,
      mime: record.mime,
      size: record.size.toString(),
      description: record.description ?? undefined,
      createdAt: record.createdAt.toISOString(),
    }
  }

  private buildObjectKey(escrowId: string, filename: string) {
    const safeName = filename.replace(/[^a-z0-9_.-]/gi, "_")
    const suffix = randomUUID()
    return `escrows/${escrowId}/${Date.now()}-${suffix}-${safeName}`
  }

  private buildUri(key: string) {
    return `${this.endpoint}/${this.bucket}/${key}`
  }

  private async ensureEscrow(escrowId: Buffer): Promise<Escrow & { dispute: unknown | null }> {
    const escrow = await this.prisma.escrow.findUnique({
      where: { escrowId },
      include: { dispute: true },
    })
    if (!escrow) {
      throw new BadRequestException("escrow not found")
    }
    return escrow
  }

  private ensureAccess(record: Escrow, caller: AuthPayload) {
    const normalized = this.normalizeAddress(caller.address)
    const participant =
      record.seller === normalized || record.buyer === normalized
    const privileged =
      caller.roles.includes("ADMIN") || caller.roles.includes("ARBITRATOR")
    if (!participant && !privileged) {
      throw new ForbiddenException("insufficient permissions for this escrow")
    }
  }

  private normalizeAddress(address: string) {
    try {
      return ethers.getAddress(address).toLowerCase()
    } catch {
      throw new BadRequestException("invalid ethereum address")
    }
  }
}
