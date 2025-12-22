import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common"
import { AdminService } from "./admin.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../rbac/guards/roles.guard"
import { Roles } from "../rbac/decorators/roles.decorator"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import type { AuthPayload } from "../auth/types/auth-payload"
import { AdminWithdrawDto } from "./dto/withdraw.dto"
import { AdminRoleDto } from "./dto/admin-role.dto"
import { AdminTokenDto } from "./dto/admin-token.dto"

@Roles("ADMIN")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("v1/admin")
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get("pools")
  listPools(@Query("tokenKey") tokenKey?: string) {
    return this.service.listPools(tokenKey)
  }

  @Post("withdraw")
  withdraw(
    @Body() payload: AdminWithdrawDto,
    @CurrentUser() user: AuthPayload
  ) {
    return this.service.recordWithdraw(payload, user)
  }

  @Post("roles/arbitrators")
  addArbitrator(@Body() payload: AdminRoleDto, @CurrentUser() user: AuthPayload) {
    return this.service.addArbitrator(payload, user)
  }

  @Post("roles/admins")
  addAdmin(@Body() payload: AdminRoleDto, @CurrentUser() user: AuthPayload) {
    return this.service.addAdmin(payload, user)
  }

  @Get("tokens")
  listTokens(
    @Query("chainId") chainId?: string,
    @Query("tokenKey") tokenKey?: string
  ) {
    const parsed = chainId ? Number(chainId) : undefined
    return this.service.listTokens(parsed, tokenKey)
  }

  @Post("tokens")
  upsertToken(
    @Body() payload: AdminTokenDto,
    @CurrentUser() user: AuthPayload
  ) {
    return this.service.upsertToken(payload, user)
  }
}
