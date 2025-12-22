import { Controller, Get, UseGuards } from "@nestjs/common"
import { RbacService } from "./rbac.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { CurrentUser } from "../auth/decorators/current-user.decorator"

@Controller("v1/rbac")
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get("health")
  health() {
    return { status: "rbac module ready" }
  }

  @UseGuards(JwtAuthGuard)
  @Get("roles")
  async me(@CurrentUser("address") address: string) {
    const roles = await this.rbacService.getRoles(address)
    return { address, roles }
  }
}
