import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common"
import { DisputeService } from "./dispute.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { Roles } from "../rbac/decorators/roles.decorator"
import { RolesGuard } from "../rbac/guards/roles.guard"
import { OpenDisputeDto } from "./dto/open-dispute.dto"
import { RecommendationDto } from "./dto/recommendation.dto"
import { ResolveDisputeDto } from "./dto/resolve-dispute.dto"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import type { AuthPayload } from "../auth/types/auth-payload"

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("v1")
export class DisputeController {
  constructor(private readonly service: DisputeService) {}

  @Post("escrows/:escrowId/dispute/open")
  open(
    @Param("escrowId") escrowId: string,
    @Body() payload: OpenDisputeDto,
    @CurrentUser() user: AuthPayload
  ) {
    return this.service.openDispute(escrowId, payload, user)
  }

  @Roles("ADMIN", "ARBITRATOR")
  @Get("disputes")
  list(@Query("status") status?: string) {
    return this.service.listDisputes(status)
  }

  @Roles("ADMIN", "ARBITRATOR")
  @Get("disputes/:escrowId")
  detail(@Param("escrowId") escrowId: string) {
    return this.service.getDispute(escrowId)
  }

  @Roles("ADMIN", "ARBITRATOR")
  @Post("disputes/:escrowId/recommendation")
  recommend(
    @Param("escrowId") escrowId: string,
    @Body() payload: RecommendationDto,
    @CurrentUser() user: AuthPayload
  ) {
    return this.service.addRecommendation(escrowId, payload, user)
  }

  @Roles("ARBITRATOR")
  @Post("disputes/:escrowId/resolve")
  resolve(
    @Param("escrowId") escrowId: string,
    @Body() payload: ResolveDisputeDto,
    @CurrentUser() user: AuthPayload
  ) {
    return this.service.resolveDispute(escrowId, payload, user)
  }
}
