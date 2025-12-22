import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common"
import { NotificationsService } from "./notifications.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import type { AuthPayload } from "../auth/types/auth-payload"
import { NotificationPreferencesDto } from "./preferences/notification-preferences.dto"

@Controller("v1/notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("health")
  health() {
    return { status: "notifications ready" }
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get("preferences")
  getPreferences(@CurrentUser() user: AuthPayload) {
    if (!user?.address) {
      return {
        address: null,
        webhookUrl: null,
        email: null,
        telegramId: null,
        smsNumber: null,
      }
    }
    return this.notificationsService.getPreferences(user.address)
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post("preferences")
  upsertPreferences(
    @CurrentUser() user: AuthPayload,
    @Body() payload: NotificationPreferencesDto
  ) {
    if (!user?.address) {
      return {
        address: null,
        ...payload,
      }
    }
    return this.notificationsService.upsertPreferences(user.address, payload)
  }
}
