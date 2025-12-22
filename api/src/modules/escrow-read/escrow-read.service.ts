import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { Dispute, Escrow, EscrowPaymentInstruction, EscrowTimeline, Prisma } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service"
import { QueryEscrowsDto } from "./dto/query-escrows.dto"
import { formatEscrowId, parseEscrowId } from "../../utils/escrow-id.util"
import type { AuthPayload } from "../auth/types/auth-payload"
import {
  DisputeOutcome,
  EscrowDetail,
  EscrowSummary,
  EscrowTimelineEntry,
  EscrowState,
} from "@trustfy/shared"
import { ethers } from "ethers"

@Injectable()
export class EscrowReadService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryEscrowsDto, callerAddress?: string) {
    const where: Prisma.EscrowWhereInput = {}
    if (query.status) {
      where.state = query.status
    }
    if (query.tokenKey) {
      where.tokenKey = ethers.getAddress(query.tokenKey).toLowerCase()
    }

    if (query.role) {
      if (!callerAddress) {
        throw new ForbiddenException("role filter requires authentication")
      }
      const normalized = this.normalizeAddress(callerAddress)
      if (query.role === "seller") {
        where.seller = normalized
      } else {
        where.buyer = normalized
      }
    }

    const page = Math.max(query.page ?? 1, 1)
    const pageSize = Math.min(query.pageSize ?? 20, 100)
    const skip = (page - 1) * pageSize

    const [items, total] = await this.prisma.$transaction([
      this.prisma.escrow.findMany({
        where,
        orderBy: { updatedAtBlock: "desc" },
        skip,
        take: pageSize,
      }),
      this.prisma.escrow.count({ where }),
    ])

    return {
      items: items.map((escrow) => this.mapSummary(escrow)),
      meta: { total },
    }
  }

  async getDetail(escrowId: string, caller?: AuthPayload): Promise<EscrowDetail> {
    const escrow = await this.findEscrowRecord(escrowId)
    this.ensureAccess(escrow, caller)

    const paymentInstructions =
      escrow.paymentInstruction && escrow.paymentInstruction.content
        ? {
            contentJson: escrow.paymentInstruction.content as Record<string, unknown>,
            updatedAt: escrow.paymentInstruction.updatedAt.toISOString(),
          }
        : undefined

    return {
      ...this.mapSummary(escrow),
      timeline: escrow.timeline
        .sort((a, b) => {
          if (a.blockNumber === b.blockNumber) {
            return a.logIndex - b.logIndex
          }
          return Number(a.blockNumber) - Number(b.blockNumber)
        })
        .map((entry) => this.mapTimeline(entry)),
      paymentInstructions,
      participants: this.buildParticipants(escrow),
      dispute: escrow.dispute
        ? {
            status: escrow.dispute.status,
            outcome: escrow.dispute.outcome
              ? (escrow.dispute.outcome as DisputeOutcome)
              : undefined,
          }
        : undefined,
    }
  }

  async getTimeline(
    escrowId: string,
    caller?: AuthPayload
  ): Promise<EscrowTimelineEntry[]> {
    const escrow = await this.findEscrowRecord(escrowId)
    this.ensureAccess(escrow, caller)
    return escrow.timeline
      .sort((a, b) => {
        if (a.blockNumber === b.blockNumber) {
          return a.logIndex - b.logIndex
        }
        return Number(a.blockNumber) - Number(b.blockNumber)
      })
      .map((entry) => this.mapTimeline(entry))
  }

  async getParticipants(escrowId: string, caller?: AuthPayload) {
    const escrow = await this.findEscrowRecord(escrowId)
    this.ensureAccess(escrow, caller)
    return this.buildParticipants(escrow)
  }

  private async findEscrowRecord(
    escrowId: string
  ): Promise<
    Escrow & {
      timeline: EscrowTimeline[]
      paymentInstruction: EscrowPaymentInstruction | null
      dispute: Dispute | null
    }
  > {
    const bytes = parseEscrowId(escrowId)
    const escrow = await this.prisma.escrow.findUnique({
      where: { escrowId: bytes },
      include: {
        timeline: { orderBy: [{ blockNumber: "asc" }, { logIndex: "asc" }] },
        paymentInstruction: true,
        dispute: true,
      },
    })
    if (!escrow) {
      throw new NotFoundException("escrow not found")
    }
    return escrow
  }

  private ensureAccess(escrow: Escrow, caller?: AuthPayload) {
    if (!caller) {
      throw new ForbiddenException("authentication required")
    }

    const normalized = this.normalizeAddress(caller.address)
    const hasParticipant =
      escrow.seller === normalized || escrow.buyer === normalized
    const privileged =
      caller.roles.includes("ADMIN") || caller.roles.includes("ARBITRATOR")

    if (!hasParticipant && !privileged) {
      throw new ForbiddenException("insufficient permissions to view escrow")
    }
  }

  private mapSummary(escrow: Escrow): EscrowSummary {
    return {
      escrowId: formatEscrowId(escrow.escrowId),
      chainId: escrow.chainId,
      tokenKey: escrow.tokenKey,
      amount: escrow.amount.toString(),
      feeAmount: escrow.feeAmount.toString(),
      sellerBond: escrow.sellerBond.toString(),
      buyerBond: escrow.buyerBond.toString(),
      state: escrow.state as EscrowState,
      seller: escrow.seller,
      buyer: escrow.buyer ?? undefined,
      updatedAtBlock: Number(escrow.updatedAtBlock),
      updatedAt: escrow.updatedAt.toISOString(),
    }
  }

  private mapTimeline(entry: EscrowTimeline): EscrowTimelineEntry {
    return {
      id: entry.id.toString(),
      escrowId: formatEscrowId(entry.escrowId),
      eventName: entry.eventName,
      stateAfter: entry.stateAfter as EscrowState,
      txHash: entry.txHash,
      blockNumber: Number(entry.blockNumber),
      logIndex: entry.logIndex,
      timestamp: entry.timestamp.toISOString(),
      payload: entry.payload as Record<string, unknown>,
    }
  }

  private buildParticipants(escrow: Escrow & { dispute?: Dispute | null }) {
    return {
      seller: escrow.seller,
      buyer: escrow.buyer ?? undefined,
      arbitrator: escrow.dispute?.arbitratorAssigned ?? undefined,
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
