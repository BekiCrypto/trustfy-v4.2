import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { randomBytes } from "node:crypto"
import { ethers } from "ethers"
import { CreateNonceDto } from "./dto/create-nonce.dto"
import { LoginDto } from "./dto/login.dto"
import {
  AUTH_DEFAULT_DOMAIN,
  AUTH_NONCE_TTL_SECONDS,
} from "./auth.constants"
import {
  AuthMessagePayload,
  buildAuthMessage,
  hashNonce,
  signatureMatchesMessage,
} from "./auth.helpers"

@Injectable()
export class AuthService {
  private readonly nonceLifetimeMs: number
  private readonly defaultDomain: string
  private readonly jwtExpiry: string

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    const ttlSeconds = Number(
      this.configService.get("AUTH_NONCE_TTL_SECONDS") ?? AUTH_NONCE_TTL_SECONDS
    )
    this.nonceLifetimeMs = (Number.isFinite(ttlSeconds) ? ttlSeconds : AUTH_NONCE_TTL_SECONDS) * 1000
    this.defaultDomain =
      this.configService.get<string>("AUTH_DOMAIN") ?? AUTH_DEFAULT_DOMAIN
    this.jwtExpiry = this.configService.get<string>("JWT_EXPIRES_IN", "15m")
  }

  async createNonce(dto: CreateNonceDto) {
    const normalizedAddress = this.normalizeAddress(dto.address)
    const issuedAt = new Date()
    const expiresAt = new Date(issuedAt.getTime() + this.nonceLifetimeMs)
    const nonce = randomBytes(16).toString("hex")
    const payload: AuthMessagePayload = {
      domain: dto.domain ?? this.defaultDomain,
      address: normalizedAddress,
      chainId: dto.chainId,
      nonce,
      issuedAt: issuedAt.toISOString(),
      expirationTime: expiresAt.toISOString(),
    }

    await this.prisma.nonce.create({
      data: {
        address: normalizedAddress,
        value: hashNonce(nonce),
        chainId: dto.chainId,
        domain: payload.domain,
        issuedAt,
        expiresAt,
      },
    })

    return {
      nonce,
      message: buildAuthMessage(payload),
      expiresAt: payload.expirationTime,
      issuedAt: payload.issuedAt,
      domain: payload.domain,
      chainId: payload.chainId,
    }
  }

  async login(dto: LoginDto) {
    const normalizedAddress = this.normalizeAddress(dto.address)
    const hashedNonce = hashNonce(dto.nonce)
    const nonceRecord = await this.prisma.nonce.findFirst({
      where: {
        address: normalizedAddress,
        value: hashedNonce,
        used: false,
      },
    })

    if (!nonceRecord) {
      throw new UnauthorizedException("Invalid or missing nonce")
    }

    if (nonceRecord.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException("Nonce expired")
    }

    const payload: AuthMessagePayload = {
      domain: nonceRecord.domain ?? this.defaultDomain,
      address: normalizedAddress,
      chainId: nonceRecord.chainId,
      nonce: dto.nonce,
      issuedAt: nonceRecord.issuedAt.toISOString(),
      expirationTime: nonceRecord.expiresAt.toISOString(),
    }

    const message = buildAuthMessage(payload)

    if (!signatureMatchesMessage(dto.signature, message, normalizedAddress)) {
      throw new UnauthorizedException("Signature mismatch")
    }

    await this.prisma.nonce.update({
      where: { id: nonceRecord.id },
      data: { used: true },
    })

    await this.prisma.user.upsert({
      where: { address: normalizedAddress },
      create: {
        address: normalizedAddress,
        lastLoginAt: new Date(),
      },
      update: {
        lastLoginAt: new Date(),
      },
    })

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
    })

    // Bootstrap privileged roles from environment
    // ADMIN:
    // 1) If no ADMIN exists yet, grant ADMIN to the first successful login
    // 2) If ADMIN_BOOTSTRAP_ADDRESSES / ADMIN_WALLETS includes this address, ensure ADMIN role
    try {
      const bootstrapRaw =
        this.configService.get<string>("ADMIN_BOOTSTRAP_ADDRESSES") ??
        this.configService.get<string>("ADMIN_WALLETS") ??
        ""
      const bootstrap = bootstrapRaw
        .split(",")
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean)
      const anyAdmin = await this.prisma.role.findFirst({ where: { role: "ADMIN" } })
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
        })
      }
    } catch {
      // ignore bootstrap failures; normal auth continues
    }

    // SUPER_ADMIN:
    // If SUPER_ADMIN_WALLETS includes this address, ensure SUPER_ADMIN role
    try {
      const superAdminRaw =
        this.configService.get<string>("SUPER_ADMIN_WALLETS") ?? ""
      const superAdmins = superAdminRaw
        .split(",")
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean)
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
        })
      }
    } catch {
      // ignore
    }

    const roles = await this.prisma.role.findMany({
      where: { address: normalizedAddress },
    })
    const roleNames = roles.map((role) => role.role)

    const token = this.jwtService.sign(
      {
        address: normalizedAddress,
        roles: roleNames,
      },
      {
        subject: normalizedAddress,
        expiresIn: this.jwtExpiry as unknown as number,
      }
    )

    const decoded = this.jwtService.decode(token) as {
      exp?: number
    } | null

    await this.prisma.auditLog.create({
      data: {
        actorAddress: normalizedAddress,
        action: "auth:login",
        metadata: {
          chainId: nonceRecord.chainId,
        },
      },
    })

    return {
      accessToken: token,
      expiresAt: decoded?.exp
        ? new Date(decoded.exp * 1000).toISOString()
        : null,
      address: normalizedAddress,
      roles: roleNames,
    }
  }

  async getProfile(address: string) {
    const user = await this.prisma.user.findUnique({
      where: { address },
      include: {
        roles: true,
        prime: true,
        notificationPreference: true,
      },
    })
    return user
  }

  async logout(address: string) {
    await this.prisma.auditLog.create({
      data: {
        actorAddress: address,
        action: "auth:logout",
      },
    })
  }

  private normalizeAddress(address: string) {
    try {
      return ethers.getAddress(address).toLowerCase()
    } catch {
      throw new BadRequestException("Invalid Ethereum address")
    }
  }
}
