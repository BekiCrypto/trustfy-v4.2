import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { Prisma, Dispute, Escrow } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service"
import { NotificationsService } from "../notifications/notifications.service"
import { RbacService } from "../rbac/rbac.service"
import { parseEscrowId, formatEscrowId } from "../../utils/escrow-id.util"
import type { AuthPayload } from "../auth/types/auth-payload"
import { NotificationEvent } from "../notifications/types/notification-event"
import { OpenDisputeDto } from "./dto/open-dispute.dto"
import { RecommendationDto } from "./dto/recommendation.dto"
import { ResolveDisputeDto } from "./dto/resolve-dispute.dto"
import type { DisputeSummary } from "@trustfy/shared"
import { ethers } from "ethers"

@Injectable()
export class DisputeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly rbacService: RbacService
  ) {}

  async openDispute(
    escrowId: string,
    payload: OpenDisputeDto,
    caller: AuthPayload
  ) {
    const escrow = await this.findEscrow(parseEscrowId(escrowId))
    this.ensureParticipant(escrow, caller)

    if (!["FUNDED", "PAYMENT_CONFIRMED"].includes(escrow.state)) {
      throw new BadRequestException("escrow must be funded or payment confirmed")
    }

    const normalized = this.normalizeAddress(caller.address)

    const dispute = await this.prisma.dispute.upsert({
      where: { escrowId: escrow.escrowId },
      create: {
        escrowId: escrow.escrowId,
        openedBy: normalized,
        reasonCode: payload.reasonCode,
        summary: payload.summary,
        status: "OPEN",
      },
      update: {
        openedBy: normalized,
        reasonCode: payload.reasonCode,
        summary: payload.summary,
        status: "OPEN",
      },
    })

    await this.prisma.escrow.update({
      where: { escrowId: escrow.escrowId },
      data: {
        state: "DISPUTED",
      },
    })

    await this.notifications.queueEvent(
      this.buildEvent("dispute/open", escrowId, normalized, payload as unknown as Record<string, unknown>)
    )
    await this.rbacService.logAction(
      normalized,
      "dispute:open",
      escrowId,
      payload as unknown as Record<string, unknown>
    )
    return this.mapToSummary(dispute)
  }

  async listDisputes(status?: string) {
    const where: Prisma.DisputeWhereInput = {}
    if (status) {
      where.status = status
    }

    const rows = await this.prisma.dispute.findMany({
      where,
      include: {
        Escrow: true,
      },
      orderBy: { updatedAt: "desc" },
    })

    return rows.map((entry) => this.mapToSummary(entry))
  }

  async getDispute(escrowId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { escrowId: parseEscrowId(escrowId) },
      include: { Escrow: true },
    })
    if (!dispute) {
      throw new NotFoundException("dispute not found")
    }
    return {
      ...this.mapToSummary(dispute),
      escrow: dispute.Escrow
        ? {
            escrowId: formatEscrowId(dispute.Escrow.escrowId),
            seller: dispute.Escrow.seller,
            buyer: dispute.Escrow.buyer ?? undefined,
            state: dispute.Escrow.state,
          }
        : undefined,
    }
  }

  async addRecommendation(
    escrowId: string,
    payload: RecommendationDto,
    caller: AuthPayload
  ) {
    this.ensureArbitratorOrAdmin(caller)
    const dispute = await this.findDispute(parseEscrowId(escrowId))
    const normalized = this.normalizeAddress(caller.address)

    const summary = payload.note
      ? `${payload.summary}\nNote: ${payload.note}`
      : payload.summary

    const updated = await this.prisma.dispute.update({
      where: { escrowId: dispute.escrowId },
      data: {
        summary,
        status: "RECOMMENDED",
      },
    })

    await this.rbacService.logAction(
      normalized,
      "dispute:recommendation",
      escrowId,
      payload as unknown as Record<string, unknown>
    )
    await this.notifications.queueEvent(
      this.buildEvent(
        "dispute/recommendation",
        escrowId,
        normalized,
        payload as unknown as Record<string, unknown>
      )
    )

    return this.mapToSummary(updated)
  }

  async resolveDispute(
    escrowId: string,
    payload: ResolveDisputeDto,
    caller: AuthPayload
  ) {
    this.ensureArbitrator(caller)
    const dispute = await this.findDispute(parseEscrowId(escrowId))
    const normalized = this.normalizeAddress(caller.address)

    const refBuffer = payload.ref
      ? Buffer.from(payload.ref.replace(/^0x/, ""), "hex")
      : undefined

    const updated = await this.prisma.dispute.update({
      where: { escrowId: dispute.escrowId },
      data: {
        summary: payload.outcome,
        status: "RESOLVED",
        outcome: payload.outcome,
        arbitratorAssigned: normalized,
        ref: refBuffer,
      },
    })

    await this.notifications.queueEvent(
      this.buildEvent(
        "dispute/resolved",
        escrowId,
        normalized,
        payload as unknown as Record<string, unknown>
      )
    )

    await this.prisma.escrow.update({
      where: { escrowId: dispute.escrowId },
      data: {
        state: "RESOLVED",
      },
    })

    await this.rbacService.logAction(
      normalized,
      "dispute:resolve",
      escrowId,
      payload as unknown as Record<string, unknown>
    )
    return this.mapToSummary(updated)
  }

  private mapToSummary(entry: Dispute): DisputeSummary {
    return {
      escrowId: formatEscrowId(entry.escrowId),
      status: entry.status,
      openedBy: entry.openedBy,
      outcome: entry.outcome ? (entry.outcome as DisputeSummary["outcome"]) : undefined,
      summary: entry.summary ?? undefined,
      updatedAt: entry.updatedAt.toISOString(),
    }
  }

  private async findEscrow(escrowId: Buffer): Promise<Escrow> {
    const escrow = await this.prisma.escrow.findUnique({
      where: { escrowId },
    })
    if (!escrow) {
      throw new NotFoundException("escrow not found")
    }
    return escrow
  }

  private async findDispute(escrowId: Buffer): Promise<Dispute> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { escrowId },
    })
    if (!dispute) {
      throw new NotFoundException("dispute not found")
    }
    return dispute
  }

  private ensureParticipant(escrow: Escrow, caller: AuthPayload) {
    const normalized = this.normalizeAddress(caller.address)
    const participant = escrow.seller === normalized || escrow.buyer === normalized
    if (participant) {
      return
    }
    if (caller.roles.includes("ADMIN") || caller.roles.includes("ARBITRATOR")) {
      return
    }
    throw new ForbiddenException("not part of escrow")
  }

  private ensureArbitrator(caller: AuthPayload) {
    if (!caller.roles.includes("ARBITRATOR")) {
      throw new ForbiddenException("arbitrator role required")
    }
  }

  private ensureArbitratorOrAdmin(caller: AuthPayload) {
    if (!caller.roles.includes("ARBITRATOR") && !caller.roles.includes("ADMIN")) {
      throw new ForbiddenException("requires arbitrator or admin role")
    }
  }

  private normalizeAddress(address: string) {
    try {
      return ethers.getAddress(address).toLowerCase()
    } catch {
      throw new BadRequestException("invalid ethereum address")
    }
  }

  private buildEvent(
    type: string,
    escrowId: string,
    sender: string,
    payload: Record<string, unknown>
  ): NotificationEvent {
    return {
      type,
      escrowId,
      sender,
      payload,
    }
  }
}
