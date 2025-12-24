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

    const recipient = this.getOtherParty(escrow, normalized)
    if (recipient) {
      await this.notifications.queueEvent({
        userAddress: recipient,
        title: "Dispute Opened",
        message: `Dispute opened for escrow ${formatEscrowId(escrow.escrowId)}`,
        type: "dispute/open",
        escrowId,
        sender: normalized,
        payload: payload as unknown as Record<string, unknown>,
      })
    }

    await this.rbacService.logAction(
      normalized,
      "dispute:open",
      escrowId,
      payload as unknown as Record<string, unknown>
    )
    return this.mapToSummary(dispute)
  }

  async listDisputes(status?: string, assignee?: string) {
    const where: Prisma.DisputeWhereInput = {}
    if (status) {
      where.status = status
    }
    if (assignee) {
      where.arbitratorAssigned = this.normalizeAddress(assignee)
    }

    const rows = await this.prisma.dispute.findMany({
      where,
      include: {
        Escrow: true,
      },
      orderBy: { updatedAt: "desc" },
    })

    return rows.map((entry) => ({
      ...this.mapToSummary(entry),
      escrow: {
        escrowId: formatEscrowId(entry.Escrow.escrowId),
        seller: entry.Escrow.seller,
        buyer: entry.Escrow.buyer ?? undefined,
        state: entry.Escrow.state,
        amount: entry.Escrow.amount.toString(),
        tokenKey: entry.Escrow.tokenKey,
      }
    }))
  }

  async claimDispute(escrowId: string, caller: AuthPayload) {
    this.ensureArbitrator(caller)
    const dispute = await this.findDispute(parseEscrowId(escrowId))
    const normalized = this.normalizeAddress(caller.address)

    if (dispute.arbitratorAssigned) {
      throw new BadRequestException("dispute already assigned")
    }

    const updated = await this.prisma.dispute.update({
      where: { escrowId: dispute.escrowId },
      data: {
        arbitratorAssigned: normalized,
        status: "IN_PROGRESS", // Mark as picked up
      },
    })

    await this.rbacService.logAction(
      normalized,
      "dispute:claim",
      escrowId,
      {}
    )

    return this.mapToSummary(updated)
  }

  async escalateDispute(escrowId: string, level: number, status: string, caller: AuthPayload) {
    // Only participants or arbitrators can escalate? 
    // Usually anyone involved can escalate if they are unhappy.
    const dispute = await this.findDispute(parseEscrowId(escrowId))
    
    // Validate level
    if (level <= dispute.escalationLevel) {
      throw new BadRequestException("cannot de-escalate or stay on same level")
    }

    const updated = await this.prisma.dispute.update({
      where: { escrowId: dispute.escrowId },
      data: {
        escalationLevel: level,
        status: status,
      },
    })
    
    return this.mapToSummary(updated)
  }

  async saveAIAnalysis(escrowId: string, analysis: any, tier: number) {
    const dispute = await this.findDispute(parseEscrowId(escrowId))
    
    const data: Prisma.DisputeUpdateInput = {}
    if (tier === 1) {
      data.aiAnalysis = analysis
    } else if (tier === 2) {
      data.tier2Analysis = analysis
    }

    const updated = await this.prisma.dispute.update({
      where: { escrowId: dispute.escrowId },
      data,
    })
    
    return this.mapToSummary(updated)
  }

  async getDispute(escrowId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { escrowId: parseEscrowId(escrowId) },
      include: { 
        Escrow: {
          include: {
            messages: true,
            evidence: true,
          }
        } 
      },
    })
    if (!dispute) {
      throw new NotFoundException("dispute not found")
    }
    return {
      ...this.mapToSummary(dispute),
      aiAnalysis: dispute.aiAnalysis,
      tier2Analysis: dispute.tier2Analysis,
      escalationLevel: dispute.escalationLevel,
      escrow: dispute.Escrow
        ? {
            escrowId: formatEscrowId(dispute.Escrow.escrowId),
            seller: dispute.Escrow.seller,
            buyer: dispute.Escrow.buyer ?? undefined,
            state: dispute.Escrow.state,
            amount: dispute.Escrow.amount.toString(),
            tokenKey: dispute.Escrow.tokenKey,
            messages: dispute.Escrow.messages,
            evidence: dispute.Escrow.evidence,
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
    const escrow = await this.findEscrow(parseEscrowId(escrowId))
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
    
    const recipients = [escrow.seller, escrow.buyer].filter(Boolean) as string[]
    for (const recipient of recipients) {
      await this.notifications.queueEvent({
        userAddress: recipient,
        title: "Dispute Recommendation",
        message: `Recommendation added: ${payload.summary}`,
        type: "dispute/recommendation",
        escrowId,
        sender: normalized,
        payload: payload as unknown as Record<string, unknown>,
      })
    }

    return this.mapToSummary(updated)
  }

  async resolveDispute(
    escrowId: string,
    payload: ResolveDisputeDto,
    caller: AuthPayload
  ) {
    this.ensureArbitrator(caller)
    const dispute = await this.findDispute(parseEscrowId(escrowId))
    const escrow = await this.findEscrow(parseEscrowId(escrowId))
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

    const recipients = [escrow.seller, escrow.buyer].filter(Boolean) as string[]
    for (const recipient of recipients) {
      await this.notifications.queueEvent({
        userAddress: recipient,
        title: "Dispute Resolved",
        message: `Dispute resolved with outcome: ${payload.outcome}`,
        type: "dispute/resolved",
        escrowId,
        sender: normalized,
        payload: payload as unknown as Record<string, unknown>,
      })
    }

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

  private getOtherParty(escrow: Escrow, sender: string): string | null {
    if (escrow.seller === sender) return escrow.buyer
    if (escrow.buyer === sender) return escrow.seller
    return null
  }

  private normalizeAddress(address: string) {
    try {
      return ethers.getAddress(address).toLowerCase()
    } catch {
      throw new BadRequestException("invalid ethereum address")
    }
  }
}
