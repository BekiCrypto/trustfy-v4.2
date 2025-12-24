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
exports.RbacService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ethers_1 = require("ethers");
let RbacService = class RbacService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRoles(address) {
        const normalized = this.normalizeAddress(address);
        const roles = await this.prisma.role.findMany({
            where: { address: normalized },
            orderBy: { createdAt: "asc" },
        });
        return roles.map((entry) => entry.role);
    }
    async userHasRole(address, role) {
        const normalized = this.normalizeAddress(address);
        const match = await this.prisma.role.findFirst({
            where: { address: normalized, role },
        });
        return Boolean(match);
    }
    async assignRole(address, role, createdBy) {
        const normalized = this.normalizeAddress(address);
        const creator = createdBy ? this.normalizeAddress(createdBy) : normalized;
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
        });
    }
    async logAction(actor, action, target, metadata) {
        return this.prisma.auditLog.create({
            data: {
                actorAddress: actor ? this.normalizeAddress(actor) : null,
                action,
                target,
                metadata: (metadata ?? {}),
            },
        });
    }
    normalizeAddress(address) {
        try {
            return ethers_1.ethers.getAddress(address).toLowerCase();
        }
        catch {
            throw new common_1.BadRequestException("Invalid Ethereum address");
        }
    }
};
exports.RbacService = RbacService;
exports.RbacService = RbacService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RbacService);
