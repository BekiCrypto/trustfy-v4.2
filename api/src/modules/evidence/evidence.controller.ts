import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common"
import { EvidenceService } from "./evidence.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import type { AuthPayload } from "../auth/types/auth-payload"
import { EvidencePresignDto } from "./dto/evidence-presign.dto"
import { EvidenceCommitDto } from "./dto/evidence-commit.dto"

@UseGuards(JwtAuthGuard)
@Controller("v1/escrows/:escrowId/evidence")
export class EvidenceController {
  constructor(private readonly service: EvidenceService) {}

  @Post("presign")
  presign(
    @Param("escrowId") escrowId: string,
    @Body() payload: EvidencePresignDto,
    @CurrentUser() user: AuthPayload
  ) {
    return this.service.presign(escrowId, payload, user)
  }

  @Post("commit")
  commit(
    @Param("escrowId") escrowId: string,
    @Body() payload: EvidenceCommitDto,
    @CurrentUser() user: AuthPayload
  ) {
    return this.service.commit(escrowId, payload, user)
  }

  @Get()
  list(
    @Param("escrowId") escrowId: string,
    @CurrentUser() user: AuthPayload
  ) {
    return this.service.list(escrowId, user)
  }
}
