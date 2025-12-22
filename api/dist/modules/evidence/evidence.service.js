var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { formatEscrowId, parseEscrowId } from "../../utils/escrow-id.util";
import { ConfigService } from "@nestjs/config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NotificationsService } from "../notifications/notifications.service";
import { ethers } from "ethers";
import { randomUUID } from "node:crypto";
let EvidenceService = class EvidenceService {
    prisma;
    configService;
    notifications;
    s3Client;
    bucket;
    endpoint;
    presignExpiry;
    constructor(prisma, configService, notifications) {
        this.prisma = prisma;
        this.configService = configService;
        this.notifications = notifications;
        const endpoint = this.configService.get("MINIO_ENDPOINT");
        const accessKey = this.configService.get("MINIO_ACCESS_KEY");
        const secretKey = this.configService.get("MINIO_SECRET_KEY");
        const region = this.configService.get("MINIO_REGION", "us-east-1");
        const bucket = this.configService.get("MINIO_BUCKET");
        if (!endpoint || !accessKey || !secretKey || !bucket) {
            throw new Error("missing MinIO configuration");
        }
        this.bucket = bucket;
        this.endpoint = endpoint.replace(/\/$/, "");
        this.presignExpiry = Number(this.configService.get("EVIDENCE_PRESIGN_TTL_SECONDS") ?? 900);
        this.s3Client = new S3Client({
            endpoint,
            region,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
            forcePathStyle: true,
        });
    }
    async presign(escrowId, payload, caller) {
        const escrow = await this.ensureEscrow(parseEscrowId(escrowId));
        this.ensureAccess(escrow, caller);
        const key = this.buildObjectKey(escrowId, payload.filename);
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: payload.mime,
            ContentLength: Number(payload.size),
            Metadata: {
                sha256: payload.sha256,
                uploader: this.normalizeAddress(caller.address),
            },
        });
        const uploadUrl = await getSignedUrl(this.s3Client, command, {
            expiresIn: this.presignExpiry,
        });
        return {
            uploadUrl,
            key,
            uri: this.buildUri(key),
            expiresAt: new Date(Date.now() + this.presignExpiry * 1000).toISOString(),
        };
    }
    async commit(escrowId, payload, caller) {
        const escrow = await this.ensureEscrow(parseEscrowId(escrowId));
        this.ensureAccess(escrow, caller);
        const normalized = this.normalizeAddress(caller.address);
        const uri = payload.uri ?? this.buildUri(payload.key);
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
        });
        await this.notifications.queueEvent({
            type: "escrow/evidence",
            escrowId,
            sender: normalized,
            payload: {
                uri,
            },
        });
        return this.mapRecord(record);
    }
    async list(escrowId, caller) {
        const escrow = await this.ensureEscrow(parseEscrowId(escrowId));
        this.ensureAccess(escrow, caller);
        const items = await this.prisma.evidenceItem.findMany({
            where: { escrowId: escrow.escrowId },
            orderBy: { createdAt: "desc" },
        });
        return items.map((item) => this.mapRecord(item));
    }
    mapRecord(record) {
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
        };
    }
    buildObjectKey(escrowId, filename) {
        const safeName = filename.replace(/[^a-z0-9_.-]/gi, "_");
        const suffix = randomUUID();
        return `escrows/${escrowId}/${Date.now()}-${suffix}-${safeName}`;
    }
    buildUri(key) {
        return `${this.endpoint}/${this.bucket}/${key}`;
    }
    async ensureEscrow(escrowId) {
        const escrow = await this.prisma.escrow.findUnique({
            where: { escrowId },
            include: { dispute: true },
        });
        if (!escrow) {
            throw new BadRequestException("escrow not found");
        }
        return escrow;
    }
    ensureAccess(record, caller) {
        const normalized = this.normalizeAddress(caller.address);
        const participant = record.seller === normalized || record.buyer === normalized;
        const privileged = caller.roles.includes("ADMIN") || caller.roles.includes("ARBITRATOR");
        if (!participant && !privileged) {
            throw new ForbiddenException("insufficient permissions for this escrow");
        }
    }
    normalizeAddress(address) {
        try {
            return ethers.getAddress(address).toLowerCase();
        }
        catch {
            throw new BadRequestException("invalid ethereum address");
        }
    }
};
EvidenceService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        ConfigService,
        NotificationsService])
], EvidenceService);
export { EvidenceService };
//# sourceMappingURL=evidence.service.js.map