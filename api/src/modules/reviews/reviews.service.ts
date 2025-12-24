import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthPayload } from "../auth/types/auth-payload";
import { CreateReviewDto } from "./dto/create-review.dto";
import { parseEscrowId } from "../../utils/escrow-id.util";
import { ethers } from "ethers";

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(user: AuthPayload, dto: CreateReviewDto) {
    const escrowId = parseEscrowId(dto.escrowId);
    const escrow = await this.prisma.escrow.findUnique({
      where: { escrowId },
    });

    if (!escrow) {
      throw new NotFoundException("Escrow not found");
    }

    const normalizedUser = user.address.toLowerCase();
    const isSeller = escrow.seller === normalizedUser;
    const isBuyer = escrow.buyer === normalizedUser;

    if (!isSeller && !isBuyer) {
      throw new ForbiddenException("You are not a participant in this trade");
    }

    const reviewedAddress = isSeller ? escrow.buyer : escrow.seller;
    
    if (!reviewedAddress) {
        throw new BadRequestException("Counterparty address not found");
    }

    // Check if review already exists
    const existing = await this.prisma.tradeReview.findUnique({
      where: {
        tradeId_reviewerAddress: {
          tradeId: escrowId,
          reviewerAddress: normalizedUser,
        },
      },
    });

    if (existing) {
      throw new BadRequestException("You have already reviewed this trade");
    }

    // Create review
    const review = await this.prisma.tradeReview.create({
      data: {
        tradeId: escrowId,
        reviewerAddress: normalizedUser,
        reviewedAddress: reviewedAddress,
        rating: dto.rating,
        reviewText: dto.reviewText,
        reviewTags: dto.reviewTags || [],
        tradeRole: isSeller ? "seller" : "buyer",
      },
    });

    // Update reputation score
    await this.updateReputationScore(reviewedAddress);

    return review;
  }

  async getReputationStats(address: string) {
    const normalized = address.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { address: normalized },
      select: {
        reputationScore: true,
        successfulTrades: true,
        totalVolume: true,
      },
    });

    return user || { reputationScore: 0, successfulTrades: 0, totalVolume: 0 };
  }

  async listReviews(tradeId?: string, reviewer?: string, reviewed?: string) {
    const where: any = {};
    if (tradeId) {
      where.tradeId = parseEscrowId(tradeId);
    }
    if (reviewer) {
      where.reviewerAddress = reviewer.toLowerCase();
    }
    if (reviewed) {
      where.reviewedAddress = reviewed.toLowerCase();
    }

    return this.prisma.tradeReview.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  private async updateReputationScore(address: string) {
    const reviews = await this.prisma.tradeReview.findMany({
      where: { reviewedAddress: address },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return;
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Scale: 5 stars = 1000 points
    // Formula: (Average Rating / 5) * 1000
    const score = Math.round((averageRating / 5) * 1000);

    await this.prisma.user.update({
      where: { address },
      data: { reputationScore: score },
    });
  }
}
