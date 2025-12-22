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
