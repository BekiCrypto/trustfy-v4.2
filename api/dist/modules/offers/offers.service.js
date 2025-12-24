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
exports.OffersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OffersService = class OffersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(payload, user) {
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
        });
    }
    async list(query) {
        const where = { status: "ACTIVE" };
        if (query.type)
            where.type = query.type;
        if (query.token)
            where.token = query.token;
        if (query.currency)
            where.currency = query.currency;
        if (query.creator) {
            where.creator = query.creator;
            delete where.status; // If filtering by creator, show all statuses? Or make it configurable.
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
        });
    }
    async get(id) {
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
        });
        if (!offer)
            throw new common_1.NotFoundException("Offer not found");
        return offer;
    }
    async update(id, payload, user) {
        const offer = await this.get(id);
        if (offer.creator.toLowerCase() !== user.address.toLowerCase()) {
            throw new common_1.ForbiddenException("Not your offer");
        }
        return this.prisma.offer.update({
            where: { id },
            data: payload,
        });
    }
    async delete(id, user) {
        const offer = await this.get(id);
        if (offer.creator.toLowerCase() !== user.address.toLowerCase()) {
            throw new common_1.ForbiddenException("Not your offer");
        }
        return this.prisma.offer.delete({ where: { id } });
    }
};
exports.OffersService = OffersService;
exports.OffersService = OffersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OffersService);
