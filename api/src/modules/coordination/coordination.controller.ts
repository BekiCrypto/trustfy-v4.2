import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common"
import { CoordinationService } from "./coordination.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import type { AuthPayload } from "../auth/types/auth-payload"
import { CreateMessageDto } from "./dto/create-message.dto"
import { PaymentInstructionDto } from "./dto/payment-instruction.dto"
import { FiatStatusDto } from "./dto/fiat-status.dto"

@UseGuards(JwtAuthGuard)
@Controller("v1/escrows")
export class CoordinationController {
  constructor(private readonly service: CoordinationService) {}

  @Get(":escrowId/messages")
  listMessages(
    @Param("escrowId") escrowId: string,
    @CurrentUser() user: AuthPayload
  ) {
    return this.service.listMessages(escrowId, user)
  }

  @Post(":escrowId/messages")
  createMessage(
    @Param("escrowId") escrowId: string,
    @Body() payload: CreateMessageDto,
    @CurrentUser() user: AuthPayload
  ) {
    return this.service.createMessage(escrowId, payload, user)
  }

  @Get(":escrowId/payment-instructions")
  paymentInstructions(
    @Param("escrowId") escrowId: string,
    @CurrentUser() user: AuthPayload
  ) {
    return this.service.getPaymentInstructions(escrowId, user)
  }

  @Post(":escrowId/payment-instructions")
  updatePaymentInstructions(
    @Param("escrowId") escrowId: string,
    @Body() payload: PaymentInstructionDto,
    @CurrentUser() user: AuthPayload
  ) {
    return this.service.updatePaymentInstructions(escrowId, payload, user)
  }

  @Post(":escrowId/fiat-status")
  recordFiatStatus(
    @Param("escrowId") escrowId: string,
    @Body() payload: FiatStatusDto,
    @CurrentUser() user: AuthPayload
  ) {
    return this.service.recordFiatStatus(escrowId, payload, user)
  }
}
