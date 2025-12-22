import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import type { Request } from "express"
import { ROLES_KEY } from "../rbac.constants"
import { RbacService } from "../rbac.service"
import type { AuthPayload } from "../../auth/types/auth-payload"

interface RequestWithUser extends Request {
  user?: AuthPayload
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? []

    if (!requiredRoles.length) {
      return true
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>()
    const user = request.user

    if (!user) {
      throw new ForbiddenException("Authentication required")
    }

    const roles = await this.rbacService.getRoles(user.address)
    request.user = { ...user, roles }

    const hasRole = requiredRoles.some((role) => roles.includes(role))
    if (!hasRole) {
      throw new ForbiddenException("Insufficient permissions")
    }

    return true
  }
}
