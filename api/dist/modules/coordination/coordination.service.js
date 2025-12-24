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
exports.CoordinationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const escrow_id_util_1 = require("../../utils/escrow-id.util");
const node_crypto_1 = require("node:crypto");
const ethers_1 = require("ethers");
const notifications_service_1 = require("../notifications/notifications.service");
let CoordinationService = class CoordinationService {
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async listMessages(escrowId, caller) {
        const escrow = await this.ensureEscrow((0, escrow_id_util_1.parseEscrowId)(escrowId));
        this.ensureAccess(escrow, caller);
        const messages = await this.prisma.escrowMessage.findMany({
            where: { escrowId: escrow.escrowId },
            orderBy: { createdAt: "asc" },
        });
        return messages.map((message) => this.toMessageItem(message));
    }
    async createMessage(escrowId, payload, caller) {
        const escrow = await this.ensureEscrow((0, escrow_id_util_1.parseEscrowId)(escrowId));
        this.ensureAccess(escrow, caller);
        const hash = (0, node_crypto_1.createHash)("sha256")
            .update(payload.text)
            .update(payload.attachmentUri ?? "")
            .digest("hex");
        const normalizedSender = this.normalizeAddress(caller.address);
        const message = await this.prisma.escrowMessage.create({
            data: {
                escrowId: escrow.escrowId,
                sender: normalizedSender,
                text: payload.text,
                attachment: payload.attachmentUri,
                hash,
            },
        });
        const recipient = this.getOtherParty(escrow, normalizedSender);
        if (recipient) {
            await this.notifications.queueEvent({
                userAddress: recipient,
                title: "New Message",
                message: `New message in escrow ${(0, escrow_id_util_1.formatEscrowId)(escrow.escrowId)}`,
                type: "escrow/message",
                escrowId,
                sender: normalizedSender,
                payload: {
                    text: payload.text,
                },
            });
        }
        return this.toMessageItem(message);
    }
    async getPaymentInstructions(escrowId, caller) {
        const escrow = await this.ensureEscrow((0, escrow_id_util_1.parseEscrowId)(escrowId));
        this.ensureAccess(escrow, caller);
        const instruction = await this.prisma.escrowPaymentInstruction.findUnique({
            where: { escrowId: escrow.escrowId },
        });
        if (!instruction) {
            return null;
        }
        return {
            seller: instruction.seller,
            contentJson: instruction.content,
            updatedAt: instruction.updatedAt.toISOString(),
        };
    }
    async updatePaymentInstructions(escrowId, payload, caller) {
        const escrow = await this.ensureEscrow((0, escrow_id_util_1.parseEscrowId)(escrowId));
        this.ensureSellerOrAdmin(escrow, caller);
        const normalizedSeller = this.normalizeAddress(caller.address);
        const instruction = await this.prisma.escrowPaymentInstruction.upsert({
            where: { escrowId: escrow.escrowId },
            create: {
                escrowId: escrow.escrowId,
                seller: normalizedSeller,
                content: (payload.contentJson ?? {}),
            },
            update: {
                seller: normalizedSeller,
                content: (payload.contentJson ?? {}),
            },
        });
        if (escrow.buyer) {
            await this.notifications.queueEvent({
                userAddress: escrow.buyer,
                title: "Payment Instructions Updated",
                message: `Payment instructions updated for escrow ${(0, escrow_id_util_1.formatEscrowId)(escrow.escrowId)}`,
                type: "escrow/payment-instruction",
                escrowId,
                sender: normalizedSeller,
                payload: {
                    updatedAt: instruction.updatedAt.toISOString(),
                },
            });
        }
        return {
            seller: instruction.seller,
            contentJson: instruction.content,
            updatedAt: instruction.updatedAt.toISOString(),
        };
    }
    async recordFiatStatus(escrowId, payload, caller) {
        const escrow = await this.ensureEscrow((0, escrow_id_util_1.parseEscrowId)(escrowId));
        this.ensureAccess(escrow, caller);
        const normalized = this.normalizeAddress(caller.address);
        const record = await this.prisma.escrowFiatStatus.create({
            data: {
                escrowId: escrow.escrowId,
                actor: normalized,
                status: payload.status,
                note: payload.note,
            },
        });
        const recipient = this.getOtherParty(escrow, normalized);
        if (recipient) {
            await this.notifications.queueEvent({
                userAddress: recipient,
                title: "Fiat Status Update",
                message: `Fiat status updated to ${payload.status}`,
                type: "escrow/fiat-status",
                escrowId,
                sender: normalized,
                payload: {
                    status: payload.status,
                },
            });
        }
        return {
            id: record.id.toString(),
            status: record.status,
            actor: record.actor,
            note: record.note ?? undefined,
            createdAt: record.createdAt.toISOString(),
        };
    }
    toMessageItem(message) {
        return {
            id: message.id,
            escrowId: (0, escrow_id_util_1.formatEscrowId)(message.escrowId),
            sender: message.sender,
            text: message.text,
            attachmentUri: message.attachment ?? undefined,
            createdAt: message.createdAt.toISOString(),
        };
    }
    async ensureEscrow(escrowId) {
        const escrow = await this.prisma.escrow.findUnique({
            where: { escrowId },
            include: { dispute: true },
        });
        if (!escrow) {
            throw new common_1.BadRequestException("escrow not found");
        }
        return escrow;
    }
    ensureAccess(record, caller) {
        const normalized = this.normalizeAddress(caller.address);
        const participant = record.seller === normalized || record.buyer === normalized;
        const privileged = caller.roles.includes("ADMIN") ||
            caller.roles.includes("ARBITRATOR") ||
            caller.roles.includes("SUPER_ADMIN");
        if (!participant && !privileged) {
            throw new common_1.ForbiddenException("not authorized for this escrow");
        }
    }
    ensureSellerOrAdmin(record, caller) {
        this.ensureAccess(record, caller);
        const normalized = this.normalizeAddress(caller.address);
        if (record.seller !== normalized &&
            !caller.roles.includes("ADMIN") &&
            !caller.roles.includes("SUPER_ADMIN")) {
            throw new common_1.ForbiddenException("only seller can update payment notes");
        }
    }
    getOtherParty(escrow, sender) {
        if (escrow.seller === sender)
            return escrow.buyer;
        if (escrow.buyer === sender)
            return escrow.seller;
        return null;
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
exports.CoordinationService = CoordinationService;
exports.CoordinationService = CoordinationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], CoordinationService);
