import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateOfferDto } from "./dto/create-offer.dto"
import { AuthPayload } from "../auth/types/auth-payload"

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateOfferDto, user: AuthPayload) {
    return this.prisma.offer.create({
      data: {
        creator: user.address,
        type: payload.type,
        token: payload.token,
        currency: payload.currency,
        priceType: payload.priceType,
        price: payload.price,
        minAmount: payload.minAmount,
        maxAmount: payload.maxAmount,
        paymentMethods: payload.paymentMethods,
        terms: payload.terms,
        status: "ACTIVE",
      },
    })
  }

  async list(query: any) {
    const where: any = { status: "ACTIVE" }
    
    if (query.type) where.type = query.type
    if (query.token) where.token = query.token
    if (query.currency) where.currency = query.currency
    if (query.creator) {
        where.creator = query.creator
        delete where.status // If filtering by creator, show all statuses? Or make it configurable.
    }

    return this.prisma.offer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
            select: {
                displayName: true,
                reputationScore: true,
                successfulTrades: true,
                prime: true
            }
        }
      }
    })
  }

  async get(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        user: {
            select: {
                displayName: true,
                reputationScore: true,
                successfulTrades: true,
                prime: true
            }
        }
      }
    })
    if (!offer) throw new NotFoundException("Offer not found")
    return offer
  }

  async update(id: string, payload: any, user: AuthPayload) {
    const offer = await this.get(id)
    if (offer.creator.toLowerCase() !== user.address.toLowerCase()) {
      throw new ForbiddenException("Not your offer")
    }
    
    return this.prisma.offer.update({
      where: { id },
      data: payload,
    })
  }
  
  async delete(id: string, user: AuthPayload) {
      const offer = await this.get(id)
      if (offer.creator.toLowerCase() !== user.address.toLowerCase()) {
        throw new ForbiddenException("Not your offer")
      }
      return this.prisma.offer.delete({ where: { id } })
  }
}
