import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { Request } from "express"
import type { AuthPayload } from "../types/auth-payload"

interface RequestWithAuth extends Request {
  user?: AuthPayload
}

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithAuth>()
    const header = request.headers["authorization"]

    if (!header || Array.isArray(header) || !header.startsWith("Bearer ")) {
      return true
    }

    const token = header.replace("Bearer ", "")

    try {
      const decoded = await this.jwtService.verifyAsync<AuthPayload>(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
        clockTolerance: 30,
      })
      request.user = decoded
    } catch {
      // Ignore invalid tokens for optional auth routes.
      request.user = undefined
    }

    return true
  }
}
