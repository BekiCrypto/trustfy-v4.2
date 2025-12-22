import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common"
import { EscrowReadService } from "./escrow-read.service"
import { QueryEscrowsDto } from "./dto/query-escrows.dto"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import type { AuthPayload } from "../auth/types/auth-payload"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard"

@Controller("v1/escrows")
export class EscrowReadController {
  constructor(private readonly service: EscrowReadService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async list(
    @Query() query: QueryEscrowsDto,
    @CurrentUser("address") address?: string
  ) {
    return this.service.list(query, address)
  }

  @UseGuards(JwtAuthGuard)
  @Get(":escrowId")
  detail(
    @Param("escrowId") escrowId: string,
    @CurrentUser() user: AuthPayload
  ) {
    return this.service.getDetail(escrowId, user)
  }

  @UseGuards(JwtAuthGuard)
  @Get(":escrowId/timeline")
  timeline(
    @Param("escrowId") escrowId: string,
    @CurrentUser() user: AuthPayload
  ) {
    return this.service.getTimeline(escrowId, user)
  }

  @UseGuards(JwtAuthGuard)
  @Get(":escrowId/participants")
  participants(
    @Param("escrowId") escrowId: string,
    @CurrentUser() user: AuthPayload
  ) {
    return this.service.getParticipants(escrowId, user)
  }
}
