"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const escrow_id_util_1 = require("../../utils/escrow-id.util");
let ReviewsService = class ReviewsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReview(user, dto) {
        const escrowId = (0, escrow_id_util_1.parseEscrowId)(dto.escrowId);
        const escrow = await this.prisma.escrow.findUnique({
            where: { escrowId },
        });
        if (!escrow) {
            throw new common_1.NotFoundException("Escrow not found");
        }
        const normalizedUser = user.address.toLowerCase();
        const isSeller = escrow.seller === normalizedUser;
        const isBuyer = escrow.buyer === normalizedUser;
        if (!isSeller && !isBuyer) {
            throw new common_1.ForbiddenException("You are not a participant in this trade");
        }
        const reviewedAddress = isSeller ? escrow.buyer : escrow.seller;
        if (!reviewedAddress) {
            throw new common_1.BadRequestException("Counterparty address not found");
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
            throw new common_1.BadRequestException("You have already reviewed this trade");
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
    async getReputationStats(address) {
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
    async listReviews(tradeId, reviewer, reviewed) {
        const where = {};
        if (tradeId) {
            where.tradeId = (0, escrow_id_util_1.parseEscrowId)(tradeId);
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
    async updateReputationScore(address) {
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
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
