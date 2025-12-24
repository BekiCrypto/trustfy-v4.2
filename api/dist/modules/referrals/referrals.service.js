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
exports.ReferralsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ethers_1 = require("ethers");
let ReferralsService = class ReferralsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    normalizeAddress(address) {
        try {
            return ethers_1.ethers.getAddress(address).toLowerCase();
        }
        catch {
            throw new common_1.BadRequestException("invalid ethereum address");
        }
    }
    ensureAdmin(caller) {
        if (!caller.roles.includes("ADMIN") && !caller.roles.includes("SUPER_ADMIN")) {
            throw new common_1.ForbiddenException("admin role required");
        }
    }
    async ensureWallet(address) {
        const normalized = this.normalizeAddress(address);
        return this.prisma.referralWallet.upsert({
            where: { address: normalized },
            update: {},
            create: {
                address: normalized,
                balance: 0,
            },
        });
    }
    async getDashboard(caller) {
        const address = this.normalizeAddress(caller.address);
        await this.ensureWallet(address);
        const codes = await this.prisma.referralCode.findMany({
            where: { address },
            orderBy: { createdAt: "desc" },
        });
        const referrals = await this.prisma.referral.findMany({
            where: { referrerAddress: address },
            orderBy: { createdAt: "desc" },
            include: {
                commissions: true,
            },
        });
        const qualifiedCount = referrals.filter((r) => r.qualified).length;
        const totalEarnings = referrals
            .flatMap((r) => r.commissions)
            .reduce((sum, c) => sum + Number(c.commissionAmount), 0);
        const wallet = await this.prisma.referralWallet.findUnique({
            where: { address },
        });
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
        };
    }
    async createCode(caller) {
        const address = this.normalizeAddress(caller.address);
        // Check if user already has a code - ensure permanent/single code per wallet
        const existing = await this.prisma.referralCode.findFirst({
            where: { address }
        });
        if (existing) {
            return existing;
        }
        // Generate deterministic code from wallet address
        // Use first 8 chars of address (after 0x)
        // If collision occurs (unlikely), extend length
        let code = address.slice(2, 10);
        let attempts = 0;
        while (attempts < 10) {
            const check = await this.prisma.referralCode.findFirst({
                where: { code }
            });
            if (!check)
                break;
            attempts++;
            code = address.slice(2, 10 + attempts);
        }
        const link = `${process.env.PUBLIC_WEB_URL ?? "http://localhost:5173"}/?ref=${code}`;
        try {
            return await this.prisma.referralCode.create({
                data: {
                    address,
                    code,
                    referralLink: link,
                },
            });
        }
        catch (error) {
            // Handle race condition where code was created between findFirst and create
            if (error.code === 'P2002') { // Unique constraint violation
                const existingAfterRace = await this.prisma.referralCode.findFirst({
                    where: { address }
                });
                if (existingAfterRace)
                    return existingAfterRace;
            }
            throw error;
        }
    }
    async getConfig() {
        const existing = await this.prisma.referralConfig.findFirst();
        if (existing)
            return existing;
        return this.prisma.referralConfig.create({
            data: {},
        });
    }
    async updateConfig(dto, caller) {
        this.ensureAdmin(caller);
        const existing = await this.getConfig();
        return this.prisma.referralConfig.update({
            where: { id: existing.id },
            data: {
                commissionRate: dto.commissionRate ?? existing.commissionRate,
                eligibleFeeTypes: dto.eligibleFeeTypes ?? existing.eligibleFeeTypes,
                primeUnlockThreshold: dto.primeUnlockThreshold ?? existing.primeUnlockThreshold,
            },
        });
    }
    async attribution(refCode, referee) {
        const code = await this.prisma.referralCode.findUnique({
            where: { code: refCode },
        });
        if (!code) {
            throw new common_1.BadRequestException("invalid referral code");
        }
        const referrerAddress = this.normalizeAddress(code.address);
        const refereeAddress = this.normalizeAddress(referee);
        // Check if referee is already attributed
        const existing = await this.prisma.referral.findFirst({
            where: { refereeAddress },
        });
        if (existing) {
            return existing;
        }
        await this.prisma.user.upsert({
            where: { address: refereeAddress },
            update: {},
            create: { address: refereeAddress },
        });
        return this.prisma.referral.create({
            data: {
                referrerAddress,
                refereeAddress,
                referralCodeId: code.id,
                qualified: false,
            },
        });
    }
    async withdraw(amount, caller) {
        const address = this.normalizeAddress(caller.address);
        const wallet = await this.ensureWallet(address);
        if (Number(wallet.balance) < amount) {
            throw new common_1.BadRequestException("insufficient balance");
        }
        const updated = await this.prisma.referralWallet.update({
            where: { id: wallet.id },
            data: { balance: Number(wallet.balance) - amount },
        });
        await this.prisma.referralWalletTransaction.create({
            data: {
                walletId: wallet.id,
                amount,
                type: "withdrawal",
                status: "completed",
            },
        });
        return updated;
    }
    async transferToCredit(amount, caller) {
        const address = this.normalizeAddress(caller.address);
        const wallet = await this.ensureWallet(address);
        if (Number(wallet.balance) < amount) {
            throw new common_1.BadRequestException("insufficient balance");
        }
        const updated = await this.prisma.referralWallet.update({
            where: { id: wallet.id },
            data: { balance: Number(wallet.balance) - amount },
        });
        await this.prisma.referralWalletTransaction.create({
            data: {
                walletId: wallet.id,
                amount,
                type: "transfer",
                status: "completed",
            },
        });
        return updated;
    }
    async getWalletTransactions(caller) {
        const address = this.normalizeAddress(caller.address);
        const wallet = await this.ensureWallet(address);
        return this.prisma.referralWalletTransaction.findMany({
            where: { walletId: wallet.id },
            orderBy: { createdAt: "desc" },
        });
    }
};
exports.ReferralsService = ReferralsService;
exports.ReferralsService = ReferralsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReferralsService);
