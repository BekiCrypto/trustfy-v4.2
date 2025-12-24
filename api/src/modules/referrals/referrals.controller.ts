import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common"
import { ReferralsService } from "./referrals.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import type { AuthPayload } from "../auth/types/auth-payload"

@Controller("v1/referrals")
export class ReferralsController {
  constructor(private readonly referrals: ReferralsService) {}

  @UseGuards(JwtAuthGuard)
  @Get("me/dashboard")
  async dashboard(@CurrentUser() caller: AuthPayload) {
    return this.referrals.getDashboard(caller)
  }

  @UseGuards(JwtAuthGuard)
  @Post("codes")
  async createCode(@CurrentUser() caller: AuthPayload) {
    return this.referrals.createCode(caller)
  }

  @Get("config")
  async getConfig() {
    return this.referrals.getConfig()
  }

  @UseGuards(JwtAuthGuard)
  @Post("config")
  async updateConfig(
    @Body()
    dto: {
      commissionRate?: number
      eligibleFeeTypes?: string
      primeUnlockThreshold?: number
    },
    @CurrentUser() caller: AuthPayload
  ) {
    return this.referrals.updateConfig(dto, caller)
  }

  @Post("attribution")
  async attribution(@Body() dto: { refCode: string; refereeAddress: string }) {
    return this.referrals.attribution(dto.refCode, dto.refereeAddress)
  }

  @UseGuards(JwtAuthGuard)
  @Post("withdraw")
  async withdraw(@Body() dto: { amount: number }, @CurrentUser() caller: AuthPayload) {
    return this.referrals.withdraw(dto.amount, caller)
  }

  @UseGuards(JwtAuthGuard)
  @Post("transfer-to-credit")
  async transfer(@Body() dto: { amount: number }, @CurrentUser() caller: AuthPayload) {
    return this.referrals.transferToCredit(dto.amount, caller)
  }

  @UseGuards(JwtAuthGuard)
  @Get("wallet/transactions")
  async getWalletTransactions(@CurrentUser() caller: AuthPayload) {
    return this.referrals.getWalletTransactions(caller)
  }
}

