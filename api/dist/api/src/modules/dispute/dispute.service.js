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
exports.DisputeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const rbac_service_1 = require("../rbac/rbac.service");
const escrow_id_util_1 = require("../../utils/escrow-id.util");
const ethers_1 = require("ethers");
let DisputeService = class DisputeService {
    prisma;
    notifications;
    rbacService;
    constructor(prisma, notifications, rbacService) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.rbacService = rbacService;
    }
    async openDispute(escrowId, payload, caller) {
        const escrow = await this.findEscrow((0, escrow_id_util_1.parseEscrowId)(escrowId));
        this.ensureParticipant(escrow, caller);
        if (!["FUNDED", "PAYMENT_CONFIRMED"].includes(escrow.state)) {
            throw new common_1.BadRequestException("escrow must be funded or payment confirmed");
        }
        const normalized = this.normalizeAddress(caller.address);
        const dispute = await this.prisma.dispute.upsert({
            where: { escrowId: escrow.escrowId },
            create: {
                escrowId: escrow.escrowId,
                openedBy: normalized,
                reasonCode: payload.reasonCode,
                summary: payload.summary,
                status: "OPEN",
            },
            update: {
                openedBy: normalized,
                reasonCode: payload.reasonCode,
                summary: payload.summary,
                status: "OPEN",
            },
        });
        await this.prisma.escrow.update({
            where: { escrowId: escrow.escrowId },
            data: {
                state: "DISPUTED",
            },
        });
        await this.notifications.queueEvent(this.buildEvent("dispute/open", escrowId, normalized, payload));
        await this.rbacService.logAction(normalized, "dispute:open", escrowId, payload);
        return this.mapToSummary(dispute);
    }
    async listDisputes(status) {
        const where = {};
        if (status) {
            where.status = status;
        }
        const rows = await this.prisma.dispute.findMany({
            where,
            include: {
                Escrow: true,
            },
            orderBy: { updatedAt: "desc" },
        });
        return rows.map((entry) => this.mapToSummary(entry));
    }
    async getDispute(escrowId) {
        const dispute = await this.prisma.dispute.findUnique({
            where: { escrowId: (0, escrow_id_util_1.parseEscrowId)(escrowId) },
            include: { Escrow: true },
        });
        if (!dispute) {
            throw new common_1.NotFoundException("dispute not found");
        }
        return {
            ...this.mapToSummary(dispute),
            escrow: dispute.Escrow
                ? {
                    escrowId: (0, escrow_id_util_1.formatEscrowId)(dispute.Escrow.escrowId),
                    seller: dispute.Escrow.seller,
                    buyer: dispute.Escrow.buyer ?? undefined,
                    state: dispute.Escrow.state,
                }
                : undefined,
        };
    }
    async addRecommendation(escrowId, payload, caller) {
        this.ensureArbitratorOrAdmin(caller);
        const dispute = await this.findDispute((0, escrow_id_util_1.parseEscrowId)(escrowId));
        const normalized = this.normalizeAddress(caller.address);
        const summary = payload.note
            ? `${payload.summary}\nNote: ${payload.note}`
            : payload.summary;
        const updated = await this.prisma.dispute.update({
            where: { escrowId: dispute.escrowId },
            data: {
                summary,
                status: "RECOMMENDED",
            },
        });
        await this.rbacService.logAction(normalized, "dispute:recommendation", escrowId, payload);
        await this.notifications.queueEvent(this.buildEvent("dispute/recommendation", escrowId, normalized, payload));
        return this.mapToSummary(updated);
    }
    async resolveDispute(escrowId, payload, caller) {
        this.ensureArbitrator(caller);
        const dispute = await this.findDispute((0, escrow_id_util_1.parseEscrowId)(escrowId));
        const normalized = this.normalizeAddress(caller.address);
        const refBuffer = payload.ref
            ? Buffer.from(payload.ref.replace(/^0x/, ""), "hex")
            : undefined;
        const updated = await this.prisma.dispute.update({
            where: { escrowId: dispute.escrowId },
            data: {
                summary: payload.outcome,
                status: "RESOLVED",
                outcome: payload.outcome,
                arbitratorAssigned: normalized,
                ref: refBuffer,
            },
        });
        await this.notifications.queueEvent(this.buildEvent("dispute/resolved", escrowId, normalized, payload));
        await this.prisma.escrow.update({
            where: { escrowId: dispute.escrowId },
            data: {
                state: "RESOLVED",
            },
        });
        await this.rbacService.logAction(normalized, "dispute:resolve", escrowId, payload);
        return this.mapToSummary(updated);
    }
    mapToSummary(entry) {
        return {
            escrowId: (0, escrow_id_util_1.formatEscrowId)(entry.escrowId),
            status: entry.status,
            openedBy: entry.openedBy,
            outcome: entry.outcome ? entry.outcome : undefined,
            summary: entry.summary ?? undefined,
            updatedAt: entry.updatedAt.toISOString(),
        };
    }
    async findEscrow(escrowId) {
        const escrow = await this.prisma.escrow.findUnique({
            where: { escrowId },
        });
        if (!escrow) {
            throw new common_1.NotFoundException("escrow not found");
        }
        return escrow;
    }
    async findDispute(escrowId) {
        const dispute = await this.prisma.dispute.findUnique({
            where: { escrowId },
        });
        if (!dispute) {
            throw new common_1.NotFoundException("dispute not found");
        }
        return dispute;
    }
    ensureParticipant(escrow, caller) {
        const normalized = this.normalizeAddress(caller.address);
        const participant = escrow.seller === normalized || escrow.buyer === normalized;
        if (participant) {
            return;
        }
        if (caller.roles.includes("ADMIN") || caller.roles.includes("ARBITRATOR")) {
            return;
        }
        throw new common_1.ForbiddenException("not part of escrow");
    }
    ensureArbitrator(caller) {
        if (!caller.roles.includes("ARBITRATOR")) {
            throw new common_1.ForbiddenException("arbitrator role required");
        }
    }
    ensureArbitratorOrAdmin(caller) {
        if (!caller.roles.includes("ARBITRATOR") && !caller.roles.includes("ADMIN")) {
            throw new common_1.ForbiddenException("requires arbitrator or admin role");
        }
    }
    normalizeAddress(address) {
        try {
            return ethers_1.ethers.getAddress(address).toLowerCase();
        }
        catch {
            throw new common_1.BadRequestException("invalid ethereum address");
        }
    }
    buildEvent(type, escrowId, sender, payload) {
        return {
            type,
            escrowId,
            sender,
            payload,
        };
    }
};
exports.DisputeService = DisputeService;
exports.DisputeService = DisputeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        rbac_service_1.RbacService])
], DisputeService);
//# sourceMappingURL=dispute.service.js.map