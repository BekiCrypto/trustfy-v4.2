import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common"
import { UsersService } from "./users.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import type { AuthPayload } from "../auth/types/auth-payload"

@Controller("v1/users")
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get(":address")
  getProfile(@Param("address") address: string) {
    return this.service.getProfile(address)
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me")
  async updateMe(
    @CurrentUser() caller: AuthPayload,
    @Body() body: { displayName?: string; bio?: string; paymentMethods?: string[] }
  ) {
    return this.service.updateProfile(caller.address, body)
  }
}
