import { BadRequestException, Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { ethers } from "ethers"

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  async getRoles(address: string) {
    const normalized = this.normalizeAddress(address)
    const roles = await this.prisma.role.findMany({
      where: { address: normalized },
      orderBy: { createdAt: "asc" },
    })
    return roles.map((entry) => entry.role)
  }

  async userHasRole(address: string, role: string) {
    const normalized = this.normalizeAddress(address)
    const match = await this.prisma.role.findFirst({
      where: { address: normalized, role },
    })
    return Boolean(match)
  }

  async assignRole(address: string, role: string, createdBy?: string) {
    const normalized = this.normalizeAddress(address)
    const creator = createdBy ? this.normalizeAddress(createdBy) : normalized
    return this.prisma.role.upsert({
      where: {
        address_role: {
          address: normalized,
          role,
        },
      },
      update: {
        createdBy: creator,
      },
      create: {
        address: normalized,
        role,
        createdBy: creator,
      },
    })
  }

  async logAction(actor: string | null, action: string, target?: string, metadata?: unknown) {
    return this.prisma.auditLog.create({
      data: {
        actorAddress: actor ? this.normalizeAddress(actor) : null,
        action,
        target,
        metadata: metadata ?? {},
      },
    })
  }

  private normalizeAddress(address: string) {
    try {
      return ethers.getAddress(address).toLowerCase()
    } catch {
      throw new BadRequestException("Invalid Ethereum address")
    }
  }
}
