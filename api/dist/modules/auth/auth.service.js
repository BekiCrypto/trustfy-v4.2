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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const node_crypto_1 = require("node:crypto");
const ethers_1 = require("ethers");
const auth_constants_1 = require("./auth.constants");
const auth_helpers_1 = require("./auth.helpers");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        const ttlSeconds = Number(this.configService.get("AUTH_NONCE_TTL_SECONDS") ?? auth_constants_1.AUTH_NONCE_TTL_SECONDS);
        this.nonceLifetimeMs = (Number.isFinite(ttlSeconds) ? ttlSeconds : auth_constants_1.AUTH_NONCE_TTL_SECONDS) * 1000;
        this.defaultDomain =
            this.configService.get("AUTH_DOMAIN") ?? auth_constants_1.AUTH_DEFAULT_DOMAIN;
        this.jwtExpiry = this.configService.get("JWT_EXPIRES_IN", "15m");
    }
    async createNonce(dto) {
        const normalizedAddress = this.normalizeAddress(dto.address);
        const issuedAt = new Date();
        const expiresAt = new Date(issuedAt.getTime() + this.nonceLifetimeMs);
        const nonce = (0, node_crypto_1.randomBytes)(16).toString("hex");
        const payload = {
            domain: dto.domain ?? this.defaultDomain,
            address: normalizedAddress,
            chainId: dto.chainId,
            nonce,
            issuedAt: issuedAt.toISOString(),
            expirationTime: expiresAt.toISOString(),
        };
        await this.prisma.nonce.create({
            data: {
                address: normalizedAddress,
                value: (0, auth_helpers_1.hashNonce)(nonce),
                chainId: dto.chainId,
                domain: payload.domain,
                issuedAt,
                expiresAt,
            },
        });
        return {
            nonce,
            message: (0, auth_helpers_1.buildAuthMessage)(payload),
            expiresAt: payload.expirationTime,
            issuedAt: payload.issuedAt,
            domain: payload.domain,
            chainId: payload.chainId,
        };
    }
    async login(dto) {
        const normalizedAddress = this.normalizeAddress(dto.address);
        const hashedNonce = (0, auth_helpers_1.hashNonce)(dto.nonce);
        const nonceRecord = await this.prisma.nonce.findFirst({
            where: {
                address: normalizedAddress,
                value: hashedNonce,
                used: false,
            },
        });
        if (!nonceRecord) {
            throw new common_1.UnauthorizedException("Invalid or missing nonce");
        }
        if (nonceRecord.expiresAt.getTime() < Date.now()) {
            throw new common_1.UnauthorizedException("Nonce expired");
        }
        const payload = {
            domain: nonceRecord.domain ?? this.defaultDomain,
            address: normalizedAddress,
            chainId: nonceRecord.chainId,
            nonce: dto.nonce,
            issuedAt: nonceRecord.issuedAt.toISOString(),
            expirationTime: nonceRecord.expiresAt.toISOString(),
        };
        const message = (0, auth_helpers_1.buildAuthMessage)(payload);
        if (!(0, auth_helpers_1.signatureMatchesMessage)(dto.signature, message, normalizedAddress)) {
            throw new common_1.UnauthorizedException("Signature mismatch");
        }
        await this.prisma.nonce.update({
            where: { id: nonceRecord.id },
            data: { used: true },
        });
        await this.prisma.user.upsert({
            where: { address: normalizedAddress },
            create: {
                address: normalizedAddress,
                lastLoginAt: new Date(),
            },
            update: {
                lastLoginAt: new Date(),
            },
        });
        await this.prisma.role.upsert({
            where: {
                address_role: {
                    address: normalizedAddress,
                    role: "USER",
                },
            },
            update: {},
            create: {
                address: normalizedAddress,
                role: "USER",
                createdBy: normalizedAddress,
            },
        });
        // Bootstrap privileged roles from environment
        // ADMIN:
        // 1) If no ADMIN exists yet, grant ADMIN to the first successful login
        // 2) If ADMIN_BOOTSTRAP_ADDRESSES / ADMIN_WALLETS includes this address, ensure ADMIN role
        try {
            const bootstrapRaw = this.configService.get("ADMIN_BOOTSTRAP_ADDRESSES") ??
                this.configService.get("ADMIN_WALLETS") ??
                "";
            const bootstrap = bootstrapRaw
                .split(",")
                .map((x) => x.trim().toLowerCase())
                .filter(Boolean);
            const anyAdmin = await this.prisma.role.findFirst({ where: { role: "ADMIN" } });
            if (!anyAdmin || bootstrap.includes(normalizedAddress)) {
                await this.prisma.role.upsert({
                    where: {
                        address_role: {
                            address: normalizedAddress,
                            role: "ADMIN",
                        },
                    },
                    update: {},
                    create: {
                        address: normalizedAddress,
                        role: "ADMIN",
                        createdBy: normalizedAddress,
                    },
                });
            }
        }
        catch {
            // ignore bootstrap failures; normal auth continues
        }
        // SUPER_ADMIN:
        // If SUPER_ADMIN_WALLETS includes this address, ensure SUPER_ADMIN role
        try {
            const superAdminRaw = this.configService.get("SUPER_ADMIN_WALLETS") ?? "";
            const superAdmins = superAdminRaw
                .split(",")
                .map((x) => x.trim().toLowerCase())
                .filter(Boolean);
            if (superAdmins.includes(normalizedAddress)) {
                await this.prisma.role.upsert({
                    where: {
                        address_role: {
                            address: normalizedAddress,
                            role: "SUPER_ADMIN",
                        },
                    },
                    update: {},
                    create: {
                        address: normalizedAddress,
                        role: "SUPER_ADMIN",
                        createdBy: normalizedAddress,
                    },
                });
            }
        }
        catch {
            // ignore
        }
        const roles = await this.prisma.role.findMany({
            where: { address: normalizedAddress },
        });
        const roleNames = roles.map((role) => role.role);
        const token = this.jwtService.sign({
            address: normalizedAddress,
            roles: roleNames,
        }, {
            subject: normalizedAddress,
            expiresIn: this.jwtExpiry,
        });
        const decoded = this.jwtService.decode(token);
        await this.prisma.auditLog.create({
            data: {
                actorAddress: normalizedAddress,
                action: "auth:login",
                metadata: {
                    chainId: nonceRecord.chainId,
                },
            },
        });
        return {
            accessToken: token,
            expiresAt: decoded?.exp
                ? new Date(decoded.exp * 1000).toISOString()
                : null,
            address: normalizedAddress,
            roles: roleNames,
        };
    }
    async getProfile(address) {
        const user = await this.prisma.user.findUnique({
            where: { address },
            include: {
                roles: true,
                prime: true,
                notificationPreference: true,
            },
        });
        return user;
    }
    async logout(address) {
        await this.prisma.auditLog.create({
            data: {
                actorAddress: address,
                action: "auth:logout",
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
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
