import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common"
import { Prisma, Escrow, EscrowMessage } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service"
import { CreateMessageDto } from "./dto/create-message.dto"
import { FiatStatusDto } from "./dto/fiat-status.dto"
import { PaymentInstructionDto } from "./dto/payment-instruction.dto"
import { formatEscrowId, parseEscrowId } from "../../utils/escrow-id.util"
import type { AuthPayload } from "../auth/types/auth-payload"
import { MessageItem } from "@trustfy/shared"
import { createHash } from "node:crypto"
import { ethers } from "ethers"
import { NotificationsService } from "../notifications/notifications.service"

@Injectable()
export class CoordinationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService
  ) {}

  async listMessages(escrowId: string, caller: AuthPayload) {
    const escrow = await this.ensureEscrow(parseEscrowId(escrowId))
    this.ensureAccess(escrow, caller)

    const messages = await this.prisma.escrowMessage.findMany({
      where: { escrowId: escrow.escrowId },
      orderBy: { createdAt: "asc" },
    })

    return messages.map((message) => this.toMessageItem(message))
  }

  async createMessage(escrowId: string, payload: CreateMessageDto, caller: AuthPayload) {
    const escrow = await this.ensureEscrow(parseEscrowId(escrowId))
    this.ensureAccess(escrow, caller)

    const hash = createHash("sha256")
      .update(payload.text)
      .update(payload.attachmentUri ?? "")
      .digest("hex")

    const normalizedSender = this.normalizeAddress(caller.address)

    const message = await this.prisma.escrowMessage.create({
      data: {
        escrowId: escrow.escrowId,
        sender: normalizedSender,
        text: payload.text,
        attachment: payload.attachmentUri,
        hash,
      },
    })

    await this.notifications.queueEvent({
      type: "escrow/message",
      escrowId,
      sender: normalizedSender,
      payload: {
        text: payload.text,
      },
    })

    return this.toMessageItem(message)
  }

  async getPaymentInstructions(escrowId: string, caller: AuthPayload) {
    const escrow = await this.ensureEscrow(parseEscrowId(escrowId))
    this.ensureAccess(escrow, caller)

    const instruction = await this.prisma.escrowPaymentInstruction.findUnique({
      where: { escrowId: escrow.escrowId },
    })

    if (!instruction) {
      return null
    }

    return {
      seller: instruction.seller,
      contentJson: instruction.content as Record<string, unknown>,
      updatedAt: instruction.updatedAt.toISOString(),
    }
  }

  async updatePaymentInstructions(
    escrowId: string,
    payload: PaymentInstructionDto,
    caller: AuthPayload
  ) {
    const escrow = await this.ensureEscrow(parseEscrowId(escrowId))
    this.ensureSellerOrAdmin(escrow, caller)

    const normalizedSeller = this.normalizeAddress(caller.address)

    const instruction = await this.prisma.escrowPaymentInstruction.upsert({
      where: { escrowId: escrow.escrowId },
      create: {
        escrowId: escrow.escrowId,
        seller: normalizedSeller,
        content: (payload.contentJson ?? {}) as Prisma.InputJsonValue,
      },
      update: {
        seller: normalizedSeller,
        content: (payload.contentJson ?? {}) as Prisma.InputJsonValue,
      },
    })

    await this.notifications.queueEvent({
      type: "escrow/payment-instruction",
      escrowId,
      sender: normalizedSeller,
      payload: {
        updatedAt: instruction.updatedAt.toISOString(),
      },
    })

    return {
      seller: instruction.seller,
      contentJson: instruction.content as Record<string, unknown>,
      updatedAt: instruction.updatedAt.toISOString(),
    }
  }

  async recordFiatStatus(escrowId: string, payload: FiatStatusDto, caller: AuthPayload) {
    const escrow = await this.ensureEscrow(parseEscrowId(escrowId))
    this.ensureAccess(escrow, caller)

    const normalized = this.normalizeAddress(caller.address)

    const record = await this.prisma.escrowFiatStatus.create({
      data: {
        escrowId: escrow.escrowId,
        actor: normalized,
        status: payload.status,
        note: payload.note,
      },
    })

    await this.notifications.queueEvent({
      type: "escrow/fiat-status",
      escrowId,
      sender: normalized,
      payload: {
        status: payload.status,
      },
    })

    return {
      id: record.id.toString(),
      status: record.status,
      actor: record.actor,
      note: record.note ?? undefined,
      createdAt: record.createdAt.toISOString(),
    }
  }

  private toMessageItem(message: EscrowMessage) {
    return {
      id: message.id,
      escrowId: formatEscrowId(message.escrowId),
      sender: message.sender,
      text: message.text,
      attachmentUri: message.attachment ?? undefined,
      createdAt: message.createdAt.toISOString(),
    } satisfies MessageItem
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
      throw new ForbiddenException("not authorized for this escrow")
    }
  }

  private ensureSellerOrAdmin(record: Escrow, caller: AuthPayload) {
    this.ensureAccess(record, caller)
    const normalized = this.normalizeAddress(caller.address)
    if (record.seller !== normalized && !caller.roles.includes("ADMIN")) {
      throw new ForbiddenException("only seller can update payment notes")
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
