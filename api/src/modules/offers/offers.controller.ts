import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common"
import { OffersService } from "./offers.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import { AuthPayload } from "../auth/types/auth-payload"
import { CreateOfferDto } from "./dto/create-offer.dto"

@Controller("v1/offers")
export class OffersController {
  constructor(private readonly service: OffersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() payload: CreateOfferDto, @CurrentUser() user: AuthPayload) {
    return this.service.create(payload, user)
  }

  @Get()
  list(
    @Query("type") type?: string,
    @Query("token") token?: string,
    @Query("currency") currency?: string,
    @Query("creator") creator?: string
  ) {
    return this.service.list({ type, token, currency, creator })
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.get(id)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() payload: any,
    @CurrentUser() user: AuthPayload
  ) {
    return this.service.update(id, payload, user)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  delete(@Param("id") id: string, @CurrentUser() user: AuthPayload) {
    return this.service.delete(id, user)
  }
}
