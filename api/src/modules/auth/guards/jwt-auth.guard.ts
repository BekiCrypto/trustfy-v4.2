import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { Request } from "express"
import type { AuthPayload } from "../types/auth-payload"

interface RequestWithAuth extends Request {
  user?: AuthPayload
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithAuth>()
    const header = request.headers["authorization"]

    if (!header || Array.isArray(header) || !header.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing Authorization bearer token")
    }

    const token = header.replace("Bearer ", "")

    try {
      const decoded = await this.jwtService.verifyAsync<AuthPayload>(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
        clockTolerance: 30,
      })

      request.user = decoded
      return true
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token")
    }
  }
}
