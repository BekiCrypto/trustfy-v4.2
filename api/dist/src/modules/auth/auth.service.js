var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, Injectable, UnauthorizedException, } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { randomBytes } from "node:crypto";
import { ethers } from "ethers";
import { AUTH_DEFAULT_DOMAIN, AUTH_NONCE_TTL_SECONDS, } from "./auth.constants";
import { buildAuthMessage, hashNonce, signatureMatchesMessage, } from "./auth.helpers";
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    nonceLifetimeMs;
    defaultDomain;
    jwtExpiry;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        const ttlSeconds = Number(this.configService.get("AUTH_NONCE_TTL_SECONDS") ?? AUTH_NONCE_TTL_SECONDS);
        this.nonceLifetimeMs = (Number.isFinite(ttlSeconds) ? ttlSeconds : AUTH_NONCE_TTL_SECONDS) * 1000;
        this.defaultDomain =
            this.configService.get("AUTH_DOMAIN") ?? AUTH_DEFAULT_DOMAIN;
        this.jwtExpiry = this.configService.get("JWT_EXPIRES_IN", "15m");
    }
    async createNonce(dto) {
        const normalizedAddress = this.normalizeAddress(dto.address);
        const issuedAt = new Date();
        const expiresAt = new Date(issuedAt.getTime() + this.nonceLifetimeMs);
        const nonce = randomBytes(16).toString("hex");
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
                value: hashNonce(nonce),
                chainId: dto.chainId,
                domain: payload.domain,
                issuedAt,
                expiresAt,
            },
        });
        return {
            nonce,
            message: buildAuthMessage(payload),
            expiresAt: payload.expirationTime,
            issuedAt: payload.issuedAt,
            domain: payload.domain,
            chainId: payload.chainId,
        };
    }
    async login(dto) {
        const normalizedAddress = this.normalizeAddress(dto.address);
        const hashedNonce = hashNonce(dto.nonce);
        const nonceRecord = await this.prisma.nonce.findFirst({
            where: {
                address: normalizedAddress,
                value: hashedNonce,
                used: false,
            },
        });
        if (!nonceRecord) {
            throw new UnauthorizedException("Invalid or missing nonce");
        }
        if (nonceRecord.expiresAt.getTime() < Date.now()) {
            throw new UnauthorizedException("Nonce expired");
        }
        const payload = {
            domain: nonceRecord.domain ?? this.defaultDomain,
            address: normalizedAddress,
            chainId: nonceRecord.chainId,
            nonce: dto.nonce,
            issuedAt: nonceRecord.issuedAt.toISOString(),
            expirationTime: nonceRecord.expiresAt.toISOString(),
        };
        const message = buildAuthMessage(payload);
        if (!signatureMatchesMessage(dto.signature, message, normalizedAddress)) {
            throw new UnauthorizedException("Signature mismatch");
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
            return ethers.getAddress(address).toLowerCase();
        }
        catch {
            throw new BadRequestException("Invalid Ethereum address");
        }
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        JwtService,
        ConfigService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map