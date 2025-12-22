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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const rbac_service_1 = require("../rbac/rbac.service");
const ethers_1 = require("ethers");
let AdminService = class AdminService {
    prisma;
    rbac;
    constructor(prisma, rbac) {
        this.prisma = prisma;
        this.rbac = rbac;
    }
    async listPools(tokenKey) {
        const where = { state: "RESOLVED" };
        if (tokenKey) {
            where.tokenKey = ethers_1.ethers.getAddress(tokenKey).toLowerCase();
        }
        const buckets = await this.prisma.escrow.groupBy({
            by: ["tokenKey"],
            where,
            _sum: {
                feeAmount: true,
                sellerBond: true,
                buyerBond: true,
            },
        });
        return buckets.map((entry) => ({
            tokenKey: entry.tokenKey,
            feeAmount: (entry._sum.feeAmount ?? 0).toString(),
            sellerBond: (entry._sum.sellerBond ?? 0).toString(),
            buyerBond: (entry._sum.buyerBond ?? 0).toString(),
        }));
    }
    async recordWithdraw(payload, caller) {
        const address = this.normalizeAddress(caller.address);
        await this.rbac.logAction(address, "admin:withdraw", payload.tokenKey, payload);
        return {
            success: true,
            requestedBy: address,
            details: payload,
        };
    }
    async addArbitrator(dto, caller) {
        return this.assignRole(dto.address, "ARBITRATOR", caller);
    }
    async addAdmin(dto, caller) {
        return this.assignRole(dto.address, "ADMIN", caller);
    }
    async listTokens(chainId, tokenKey) {
        const where = {};
        if (typeof chainId === "number") {
            where.chainId = chainId;
        }
        if (tokenKey) {
            where.tokenKey = ethers_1.ethers.getAddress(tokenKey).toLowerCase();
        }
        return this.prisma.tokenRegistry.findMany({
            where,
            orderBy: { chainId: "asc" },
        });
    }
    async upsertToken(dto, caller) {
        const normalizedToken = ethers_1.ethers.getAddress(dto.tokenKey).toLowerCase();
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
        });
        const address = this.normalizeAddress(caller.address);
        await this.rbac.logAction(address, "admin:token-upsert", normalizedToken, dto);
        return record;
    }
    async assignRole(address, role, caller) {
        const normalized = this.normalizeAddress(address);
        const creator = this.normalizeAddress(caller.address);
        const entry = await this.rbac.assignRole(normalized, role, creator);
        await this.rbac.logAction(creator, `admin:grant-${role.toLowerCase()}`, normalized, entry);
        return entry;
    }
    normalizeAddress(address) {
        return ethers_1.ethers.getAddress(address).toLowerCase();
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rbac_service_1.RbacService])
], AdminService);
//# sourceMappingURL=admin.service.js.map