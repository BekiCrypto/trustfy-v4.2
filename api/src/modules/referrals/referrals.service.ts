import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import type { AuthPayload } from "../auth/types/auth-payload"
import { ethers } from "ethers"

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeAddress(address: string) {
    try {
      return ethers.getAddress(address).toLowerCase()
    } catch {
      throw new BadRequestException("invalid ethereum address")
    }
  }

  private ensureAdmin(caller: AuthPayload) {
    if (!caller.roles.includes("ADMIN") && !caller.roles.includes("SUPER_ADMIN")) {
      throw new ForbiddenException("admin role required")
    }
  }

  async ensureWallet(address: string) {
    const normalized = this.normalizeAddress(address)
    return this.prisma.referralWallet.upsert({
      where: { address: normalized },
      update: {},
      create: {
        address: normalized,
        balance: 0,
      },
    })
  }

  async getDashboard(caller: AuthPayload) {
    const address = this.normalizeAddress(caller.address)
    await this.ensureWallet(address)

    const codes = await this.prisma.referralCode.findMany({
      where: { address },
      orderBy: { createdAt: "desc" },
    })

    const referrals = await this.prisma.referral.findMany({
      where: { referrerAddress: address },
      orderBy: { createdAt: "desc" },
      include: {
        commissions: true,
      },
    })

    const qualifiedCount = referrals.filter((r) => r.qualified).length
    const totalEarnings = referrals
      .flatMap((r) => r.commissions)
      .reduce((sum, c) => sum + Number(c.commissionAmount), 0)

    const wallet = await this.prisma.referralWallet.findUnique({
      where: { address },
    })

    return {
      address,
      codes: codes.map((c) => ({
        code: c.code,
        link: c.referralLink,
        createdAt: c.createdAt.toISOString(),
      })),
      totalReferrals: referrals.length,
      qualifiedReferrals: qualifiedCount,
      earnings: totalEarnings,
      walletBalance: wallet ? Number(wallet.balance) : 0,
      referrals: referrals.map((r) => ({
        referee: r.refereeAddress,
        qualified: r.qualified,
        qualifiedAt: r.qualifiedAt?.toISOString(),
        createdAt: r.createdAt.toISOString(),
      })),
    }
  }

  async createCode(caller: AuthPayload) {
    const address = this.normalizeAddress(caller.address)
    
    // Check if user already has a code - ensure permanent/single code per wallet
    const existing = await this.prisma.referralCode.findFirst({
      where: { address }
    })
    
    if (existing) {
      return existing
    }

    // Generate deterministic code from wallet address
    // Use first 8 chars of address (after 0x)
    // If collision occurs (unlikely), extend length
    let code = address.slice(2, 10)
    let attempts = 0
    
    while (attempts < 10) {
      const check = await this.prisma.referralCode.findFirst({
        where: { code }
      })
      
      if (!check) break
      
      attempts++
      code = address.slice(2, 10 + attempts)
    }

    const link = `${process.env.PUBLIC_WEB_URL ?? "http://localhost:5173"}/?ref=${code}`
    try {
      return await this.prisma.referralCode.create({
        data: {
          address,
          code,
          referralLink: link,
        },
      })
    } catch (error: any) {
      // Handle race condition where code was created between findFirst and create
      if (error.code === 'P2002') { // Unique constraint violation
        const existingAfterRace = await this.prisma.referralCode.findFirst({
          where: { address }
        })
        if (existingAfterRace) return existingAfterRace
      }
      throw error
    }
  }

  async getConfig() {
    const existing = await this.prisma.referralConfig.findFirst()
    if (existing) return existing
    return this.prisma.referralConfig.create({
      data: {},
    })
  }

  async updateConfig(dto: {
    commissionRate?: number
    eligibleFeeTypes?: string
    primeUnlockThreshold?: number
  }, caller: AuthPayload) {
    this.ensureAdmin(caller)
    const existing = await this.getConfig()
    return this.prisma.referralConfig.update({
      where: { id: existing.id },
      data: {
        commissionRate: dto.commissionRate ?? existing.commissionRate,
        eligibleFeeTypes: dto.eligibleFeeTypes ?? existing.eligibleFeeTypes,
        primeUnlockThreshold: dto.primeUnlockThreshold ?? existing.primeUnlockThreshold,
      },
    })
  }

  async attribution(refCode: string, referee: string) {
    const code = await this.prisma.referralCode.findUnique({
      where: { code: refCode },
    })
    if (!code) {
      throw new BadRequestException("invalid referral code")
    }
    const referrerAddress = this.normalizeAddress(code.address)
    const refereeAddress = this.normalizeAddress(referee)

    // Check if referee is already attributed
    const existing = await this.prisma.referral.findFirst({
      where: { refereeAddress },
    })
    if (existing) {
      return existing
    }

    await this.prisma.user.upsert({
      where: { address: refereeAddress },
      update: {},
      create: { address: refereeAddress },
    })

    return this.prisma.referral.create({
      data: {
        referrerAddress,
        refereeAddress,
        referralCodeId: code.id,
        qualified: false,
      },
    })
  }

  async withdraw(amount: number, caller: AuthPayload) {
    const address = this.normalizeAddress(caller.address)
    const wallet = await this.ensureWallet(address)
    if (Number(wallet.balance) < amount) {
      throw new BadRequestException("insufficient balance")
    }
    const updated = await this.prisma.referralWallet.update({
      where: { id: wallet.id },
      data: { balance: Number(wallet.balance) - amount },
    })
    await this.prisma.referralWalletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: "withdrawal",
        status: "completed",
      },
    })
    return updated
  }

  async transferToCredit(amount: number, caller: AuthPayload) {
    const address = this.normalizeAddress(caller.address)
    const wallet = await this.ensureWallet(address)
    if (Number(wallet.balance) < amount) {
      throw new BadRequestException("insufficient balance")
    }
    const updated = await this.prisma.referralWallet.update({
      where: { id: wallet.id },
      data: { balance: Number(wallet.balance) - amount },
    })
    await this.prisma.referralWalletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: "transfer",
        status: "completed",
      },
    })
    return updated
  }

  async getWalletTransactions(caller: AuthPayload) {
    const address = this.normalizeAddress(caller.address)
    const wallet = await this.ensureWallet(address)
    return this.prisma.referralWalletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
    })
  }
}
