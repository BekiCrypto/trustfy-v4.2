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
exports.EscrowReadService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const escrow_id_util_1 = require("../../utils/escrow-id.util");
const ethers_1 = require("ethers");
let EscrowReadService = class EscrowReadService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query, callerAddress) {
        const where = {};
        if (query.status) {
            where.state = query.status;
        }
        if (query.tokenKey) {
            where.tokenKey = ethers_1.ethers.getAddress(query.tokenKey).toLowerCase();
        }
        if (query.role) {
            if (!callerAddress) {
                throw new common_1.ForbiddenException("role filter requires authentication");
            }
            const normalized = this.normalizeAddress(callerAddress);
            if (query.role === "seller") {
                where.seller = normalized;
            }
            else if (query.role === "buyer") {
                where.buyer = normalized;
            }
            else if (query.role === "participant") {
                where.OR = [
                    { seller: normalized },
                    { buyer: normalized }
                ];
            }
        }
        if (query.participant) {
            const normalized = this.normalizeAddress(query.participant);
            // Allow public filtering by participant (no auth required if just viewing public history)
            // If we want to restrict this, we can add checks here.
            // For now, allow filtering by any participant address.
            // Merge with existing OR if role=participant was also set (though unlikely to mix)
            if (where.OR) {
                // If OR already exists, we must ensure BOTH conditions are met (which might be impossible if conflicting)
                // or just let this override. For simplicity, assume queries don't mix `role` and `participant`.
                // If they do, we'll AND them effectively by nesting.
                where.AND = [
                    { OR: where.OR },
                    { OR: [{ seller: normalized }, { buyer: normalized }] }
                ];
                delete where.OR;
            }
            else {
                where.OR = [
                    { seller: normalized },
                    { buyer: normalized }
                ];
            }
        }
        const page = Math.max(query.page ?? 1, 1);
        const pageSize = Math.min(query.pageSize ?? 20, 100);
        const skip = (page - 1) * pageSize;
        const [items, total] = await this.prisma.$transaction([
            this.prisma.escrow.findMany({
                where,
                orderBy: { updatedAtBlock: "desc" },
                skip,
                take: pageSize,
            }),
            this.prisma.escrow.count({ where }),
        ]);
        return {
            items: items.map((escrow) => this.mapSummary(escrow)),
            meta: { total },
        };
    }
    async getDetail(escrowId, caller) {
        const escrow = await this.findEscrowRecord(escrowId);
        this.ensureAccess(escrow, caller);
        const paymentInstructions = escrow.paymentInstruction && escrow.paymentInstruction.content
            ? {
                contentJson: escrow.paymentInstruction.content,
                updatedAt: escrow.paymentInstruction.updatedAt.toISOString(),
            }
            : undefined;
        return {
            ...this.mapSummary(escrow),
            timeline: escrow.timeline
                .sort((a, b) => {
                if (a.blockNumber === b.blockNumber) {
                    return a.logIndex - b.logIndex;
                }
                return Number(a.blockNumber) - Number(b.blockNumber);
            })
                .map((entry) => this.mapTimeline(entry)),
            paymentInstructions,
            participants: this.buildParticipants(escrow),
            dispute: escrow.dispute
                ? {
                    status: escrow.dispute.status,
                    outcome: escrow.dispute.outcome
                        ? escrow.dispute.outcome
                        : undefined,
                }
                : undefined,
        };
    }
    async getTimeline(escrowId, caller) {
        const escrow = await this.findEscrowRecord(escrowId);
        this.ensureAccess(escrow, caller);
        return escrow.timeline
            .sort((a, b) => {
            if (a.blockNumber === b.blockNumber) {
                return a.logIndex - b.logIndex;
            }
            return Number(a.blockNumber) - Number(b.blockNumber);
        })
            .map((entry) => this.mapTimeline(entry));
    }
    async getParticipants(escrowId, caller) {
        const escrow = await this.findEscrowRecord(escrowId);
        this.ensureAccess(escrow, caller);
        return this.buildParticipants(escrow);
    }
    async findEscrowRecord(escrowId) {
        const bytes = (0, escrow_id_util_1.parseEscrowId)(escrowId);
        const escrow = await this.prisma.escrow.findUnique({
            where: { escrowId: bytes },
            include: {
                timeline: { orderBy: [{ blockNumber: "asc" }, { logIndex: "asc" }] },
                paymentInstruction: true,
                dispute: true,
            },
        });
        if (!escrow) {
            throw new common_1.NotFoundException("escrow not found");
        }
        return escrow;
    }
    ensureAccess(escrow, caller) {
        if (!caller) {
            throw new common_1.ForbiddenException("authentication required");
        }
        const normalized = this.normalizeAddress(caller.address);
        const hasParticipant = escrow.seller === normalized || escrow.buyer === normalized;
        const privileged = caller.roles.includes("ADMIN") ||
            caller.roles.includes("ARBITRATOR") ||
            caller.roles.includes("SUPER_ADMIN");
        if (!hasParticipant && !privileged) {
            throw new common_1.ForbiddenException("insufficient permissions to view escrow");
        }
    }
    mapSummary(escrow) {
        return {
            escrowId: (0, escrow_id_util_1.formatEscrowId)(escrow.escrowId),
            chainId: escrow.chainId,
            tokenKey: escrow.tokenKey,
            amount: escrow.amount.toString(),
            feeAmount: escrow.feeAmount.toString(),
            sellerBond: escrow.sellerBond.toString(),
            buyerBond: escrow.buyerBond.toString(),
            state: escrow.state,
            seller: escrow.seller,
            buyer: escrow.buyer ?? undefined,
            updatedAtBlock: Number(escrow.updatedAtBlock),
            updatedAt: escrow.updatedAt.toISOString(),
        };
    }
    mapTimeline(entry) {
        return {
            id: entry.id.toString(),
            escrowId: (0, escrow_id_util_1.formatEscrowId)(entry.escrowId),
            eventName: entry.eventName,
            stateAfter: entry.stateAfter,
            txHash: entry.txHash,
            blockNumber: Number(entry.blockNumber),
            logIndex: entry.logIndex,
            timestamp: entry.timestamp.toISOString(),
            payload: entry.payload,
        };
    }
    buildParticipants(escrow) {
        return {
            seller: escrow.seller,
            buyer: escrow.buyer ?? undefined,
            arbitrator: escrow.dispute?.arbitratorAssigned ?? undefined,
        };
    }
    normalizeAddress(address) {
        try {
            return ethers_1.ethers.getAddress(address).toLowerCase();
        }
        catch {
            throw new common_1.BadRequestException("invalid ethereum address");
        }
    }
};
exports.EscrowReadService = EscrowReadService;
exports.EscrowReadService = EscrowReadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EscrowReadService);
