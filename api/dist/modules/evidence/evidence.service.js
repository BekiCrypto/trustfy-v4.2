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
exports.EvidenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const escrow_id_util_1 = require("../../utils/escrow-id.util");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const notifications_service_1 = require("../notifications/notifications.service");
const ethers_1 = require("ethers");
const node_crypto_1 = require("node:crypto");
let EvidenceService = class EvidenceService {
    constructor(prisma, configService, notifications) {
        this.prisma = prisma;
        this.configService = configService;
        this.notifications = notifications;
        const endpoint = this.configService.get("MINIO_ENDPOINT");
        const accessKey = this.configService.get("MINIO_ACCESS_KEY");
        const secretKey = this.configService.get("MINIO_SECRET_KEY");
        const region = this.configService.get("MINIO_REGION", "us-east-1");
        const bucket = this.configService.get("MINIO_BUCKET");
        if (!endpoint || !accessKey || !secretKey || !bucket) {
            throw new Error("missing MinIO configuration");
        }
        this.bucket = bucket;
        this.endpoint = endpoint.replace(/\/$/, "");
        this.presignExpiry = Number(this.configService.get("EVIDENCE_PRESIGN_TTL_SECONDS") ?? 900);
        this.s3Client = new client_s3_1.S3Client({
            endpoint,
            region,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
            forcePathStyle: true,
        });
    }
    async presign(escrowId, payload, caller) {
        const escrow = await this.ensureEscrow((0, escrow_id_util_1.parseEscrowId)(escrowId));
        this.ensureAccess(escrow, caller);
        const key = this.buildObjectKey(escrowId, payload.filename);
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: payload.mime,
            ContentLength: Number(payload.size),
            Metadata: {
                sha256: payload.sha256,
                uploader: this.normalizeAddress(caller.address),
            },
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, {
            expiresIn: this.presignExpiry,
        });
        return {
            uploadUrl,
            key,
            uri: this.buildUri(key),
            expiresAt: new Date(Date.now() + this.presignExpiry * 1000).toISOString(),
        };
    }
    async commit(escrowId, payload, caller) {
        const escrow = await this.ensureEscrow((0, escrow_id_util_1.parseEscrowId)(escrowId));
        this.ensureAccess(escrow, caller);
        const normalized = this.normalizeAddress(caller.address);
        const uri = payload.uri ?? this.buildUri(payload.key);
        const record = await this.prisma.evidenceItem.create({
            data: {
                escrowId: escrow.escrowId,
                uploader: normalized,
                uri,
                sha256: payload.sha256,
                mime: payload.mime,
                size: BigInt(payload.size),
                description: payload.description,
            },
        });
        const recipient = this.getOtherParty(escrow, normalized);
        if (recipient) {
            await this.notifications.queueEvent({
                userAddress: recipient,
                title: "New Evidence Uploaded",
                message: `New evidence uploaded in escrow ${(0, escrow_id_util_1.formatEscrowId)(escrow.escrowId)}`,
                type: "escrow/evidence",
                escrowId,
                sender: normalized,
                payload: {
                    uri,
                },
            });
        }
        return this.mapRecord(record);
    }
    async list(escrowId, caller) {
        const escrow = await this.ensureEscrow((0, escrow_id_util_1.parseEscrowId)(escrowId));
        this.ensureAccess(escrow, caller);
        const items = await this.prisma.evidenceItem.findMany({
            where: { escrowId: escrow.escrowId },
            orderBy: { createdAt: "desc" },
        });
        return items.map((item) => this.mapRecord(item));
    }
    mapRecord(record) {
        return {
            id: record.id,
            escrowId: (0, escrow_id_util_1.formatEscrowId)(record.escrowId),
            uploader: record.uploader,
            uri: record.uri,
            sha256: record.sha256,
            mime: record.mime,
            size: record.size.toString(),
            description: record.description ?? undefined,
            createdAt: record.createdAt.toISOString(),
        };
    }
    buildObjectKey(escrowId, filename) {
        const safeName = filename.replace(/[^a-z0-9_.-]/gi, "_");
        const suffix = (0, node_crypto_1.randomUUID)();
        return `escrows/${escrowId}/${Date.now()}-${suffix}-${safeName}`;
    }
    buildUri(key) {
        return `${this.endpoint}/${this.bucket}/${key}`;
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
        const privileged = caller.roles.includes("ADMIN") || caller.roles.includes("ARBITRATOR");
        if (!participant && !privileged) {
            throw new common_1.ForbiddenException("insufficient permissions for this escrow");
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
exports.EvidenceService = EvidenceService;
exports.EvidenceService = EvidenceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        notifications_service_1.NotificationsService])
], EvidenceService);
