import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(address: string) {
    const normalized = address.toLowerCase()
    const user = await this.prisma.user.findUnique({
      where: { address: normalized },
      include: {
        prime: true,
        roles: true,
      },
    })

    if (!user) return null

    // Calculate average completion time
    const completedEscrows = await this.prisma.escrow.findMany({
      where: {
        OR: [{ seller: normalized }, { buyer: normalized }],
        state: "RESOLVED"
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    })

    let averageCompletionTime = 0
    if (completedEscrows.length > 0) {
      const totalTimeMs = completedEscrows.reduce((acc, trade) => {
        return acc + (trade.updatedAt.getTime() - trade.createdAt.getTime())
      }, 0)
      const avgMs = totalTimeMs / completedEscrows.length
      averageCompletionTime = parseFloat((avgMs / (1000 * 60 * 60)).toFixed(1))
    }

    return {
      ...user,
      preferredPaymentMethods: user.paymentMethods,
      averageCompletionTime
    }
  }

  async updateProfile(address: string, data: { displayName?: string; bio?: string; paymentMethods?: string[] }) {
    // Normalize address
    const normalizedAddress = address.toLowerCase()
    
    // Ensure user exists (upsert logic if needed, but usually user exists via auth)
    // But since auth/me creates user if not exists, we should be fine updating.
    
    return this.prisma.user.update({
      where: { address: normalizedAddress },
      data: {
        ...(data.displayName && { displayName: data.displayName }),
        ...(data.bio && { bio: data.bio }),
        ...(data.paymentMethods && { paymentMethods: data.paymentMethods }),
      },
    })
  }
}
