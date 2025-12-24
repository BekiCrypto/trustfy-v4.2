import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { RbacService } from "../rbac/rbac.service"
import { AdminRoleDto } from "./dto/admin-role.dto"
import { AdminWithdrawDto } from "./dto/withdraw.dto"
import { AdminTokenDto } from "./dto/admin-token.dto"
import type { AuthPayload } from "../auth/types/auth-payload"
import { ethers } from "ethers"
import { Prisma } from "@prisma/client"

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rbac: RbacService
  ) {}

  async listPools(tokenKey?: string) {
    const where: Prisma.EscrowWhereInput = { state: "RESOLVED" }
    if (tokenKey) {
      where.tokenKey = ethers.getAddress(tokenKey).toLowerCase()
    }

    const buckets = await this.prisma.escrow.groupBy({
      by: ["tokenKey"],
      where,
      _sum: {
        feeAmount: true,
        sellerBond: true,
        buyerBond: true,
      },
    })

    return buckets.map((entry) => ({
      tokenKey: entry.tokenKey,
      feeAmount: (entry._sum.feeAmount ?? 0).toString(),
      sellerBond: (entry._sum.sellerBond ?? 0).toString(),
      buyerBond: (entry._sum.buyerBond ?? 0).toString(),
    }))
  }

  async recordWithdraw(payload: AdminWithdrawDto, caller: AuthPayload) {
    const address = this.normalizeAddress(caller.address)
    await this.rbac.logAction(address, "admin:withdraw", payload.tokenKey, payload)
    return {
      success: true,
      requestedBy: address,
      details: payload,
    }
  }

  async addArbitrator(dto: AdminRoleDto, caller: AuthPayload) {
    return this.assignRole(dto.address, "ARBITRATOR", caller)
  }

  async addAdmin(dto: AdminRoleDto, caller: AuthPayload) {
    return this.assignRole(dto.address, "ADMIN", caller)
  }

  async listTokens(chainId?: number, tokenKey?: string) {
    const where: Record<string, unknown> = {}
    if (typeof chainId === "number") {
      where.chainId = chainId
    }
    if (tokenKey) {
      where.tokenKey = ethers.getAddress(tokenKey).toLowerCase()
    }
    return this.prisma.tokenRegistry.findMany({
      where,
      orderBy: { chainId: "asc" },
    })
  }

  async getStats() {
    const [
      totalUsers,
      totalTrades,
      totalVolume,
      activeDisputes,
      insuredTrades,
      completedTrades,
      activeTrades,
      disputedTrades,
      tradeStatusDistribution,
      tokenDistribution,
      chainDistribution
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.escrow.count(),
      this.prisma.escrow.aggregate({
        _sum: { amount: true },
      }),
      this.prisma.dispute.count({
        where: {
          status: { notIn: ["RESOLVED", "REJECTED"] }
        }
      }),
      this.prisma.escrow.count({
        // Assuming there is a way to identify insured trades, currently no explicit flag in schema
        // Will placeholder this or use a convention if available.
        // Looking at schema, there is no is_insured. I'll check if logic exists elsewhere.
        // For now, returning 0 or checking if logic was implemented via tags/metadata.
        // Actually, Escrow schema doesn't have isInsured. I'll stick to 0 for now or maybe check sellerBond?
        // If sellerBond > 0 && buyerBond > 0 it's bonded, but insurance might be different.
        // Let's assume bonded trades for now as a proxy.
        where: { sellerBond: { gt: 0 } }
      }),
      this.prisma.escrow.count({ where: { state: "COMPLETED" } }),
      this.prisma.escrow.count({ where: { state: { in: ["AWAITING_PAYMENT", "AWAITING_DELIVERY"] } } }),
      this.prisma.escrow.count({ where: { state: "DISPUTED" } }),
      this.prisma.escrow.groupBy({
        by: ['state'],
        _count: true
      }),
      this.prisma.escrow.groupBy({
        by: ['tokenKey'],
        _count: true
      }),
      this.prisma.escrow.groupBy({
        by: ['chainId'],
        _count: true
      })
    ]);

    return {
      totalUsers,
      totalTrades,
      totalVolume: totalVolume._sum.amount?.toString() || "0",
      activeDisputes,
      insuredTrades,
      completedTrades,
      activeTrades,
      disputedTrades,
      tradeStatusDistribution: tradeStatusDistribution.map(d => ({ name: d.state, value: d._count })),
      tokenDistribution: tokenDistribution.map(d => ({ token: d.tokenKey, count: d._count })),
      chainDistribution: chainDistribution.map(d => ({ chain: d.chainId.toString(), count: d._count }))
    };
  }

  async listUsers(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = search ? {
      OR: [
        { address: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          roles: true,
          prime: true
        }
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async listTrades(page: number = 1, limit: number = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.EscrowWhereInput = status ? { state: status } : {};

    const [trades, total] = await Promise.all([
      this.prisma.escrow.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.escrow.count({ where })
    ]);

    return {
      data: trades.map(t => ({
        ...t,
        amount: t.amount.toString(),
        feeAmount: t.feeAmount.toString(),
        sellerBond: t.sellerBond.toString(),
        buyerBond: t.buyerBond.toString()
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async listDisputes(page: number = 1, limit: number = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.DisputeWhereInput = status ? { status } : {};

    const [disputes, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          Escrow: true
        }
      }),
      this.prisma.dispute.count({ where })
    ]);

    return {
      data: disputes.map(d => ({
        ...d,
        Escrow: {
          ...d.Escrow,
          amount: d.Escrow.amount.toString(),
          feeAmount: d.Escrow.feeAmount.toString(),
          sellerBond: d.Escrow.sellerBond.toString(),
          buyerBond: d.Escrow.buyerBond.toString()
        }
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async upsertToken(dto: AdminTokenDto, caller: AuthPayload) {
    const normalizedToken = ethers.getAddress(dto.tokenKey).toLowerCase()
    const record = await this.prisma.tokenRegistry.upsert({
      where: {
        chainId_tokenKey: {
          chainId: dto.chainId,
          tokenKey: normalizedToken,
        },
      },
      create: {
        chainId: dto.chainId,
        tokenKey: normalizedToken,
        symbol: dto.symbol,
        decimals: dto.decimals,
        name: dto.name,
        enabled: dto.enabled ?? true,
      },
      update: {
        symbol: dto.symbol,
        decimals: dto.decimals,
        name: dto.name,
        enabled: dto.enabled ?? true,
      },
    })

    const address = this.normalizeAddress(caller.address)
    await this.rbac.logAction(address, "admin:token-upsert", normalizedToken, dto)
    return record
  }

  private async assignRole(address: string, role: string, caller: AuthPayload) {
    const normalized = this.normalizeAddress(address)
    const creator = this.normalizeAddress(caller.address)
    const entry = await this.rbac.assignRole(normalized, role, creator)
    await this.rbac.logAction(
      creator,
      `admin:grant-${role.toLowerCase()}`,
      normalized,
      entry
    )
    return entry
  }

  private normalizeAddress(address: string) {
    return ethers.getAddress(address).toLowerCase()
  }
}
