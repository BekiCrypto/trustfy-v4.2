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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(address) {
        const normalized = address.toLowerCase();
        const user = await this.prisma.user.findUnique({
            where: { address: normalized },
            include: {
                prime: true,
                roles: true,
            },
        });
        if (!user)
            return null;
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
        });
        let averageCompletionTime = 0;
        if (completedEscrows.length > 0) {
            const totalTimeMs = completedEscrows.reduce((acc, trade) => {
                return acc + (trade.updatedAt.getTime() - trade.createdAt.getTime());
            }, 0);
            const avgMs = totalTimeMs / completedEscrows.length;
            averageCompletionTime = parseFloat((avgMs / (1000 * 60 * 60)).toFixed(1));
        }
        return {
            ...user,
            preferredPaymentMethods: user.paymentMethods,
            averageCompletionTime
        };
    }
    async updateProfile(address, data) {
        // Normalize address
        const normalizedAddress = address.toLowerCase();
        // Ensure user exists (upsert logic if needed, but usually user exists via auth)
        // But since auth/me creates user if not exists, we should be fine updating.
        return this.prisma.user.update({
            where: { address: normalizedAddress },
            data: {
                ...(data.displayName && { displayName: data.displayName }),
                ...(data.bio && { bio: data.bio }),
                ...(data.paymentMethods && { paymentMethods: data.paymentMethods }),
            },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
