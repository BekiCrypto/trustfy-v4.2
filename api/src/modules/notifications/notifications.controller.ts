import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common"
import { NotificationsService } from "./notifications.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import type { AuthPayload } from "../auth/types/auth-payload"
import { NotificationPreferencesDto } from "./preferences/notification-preferences.dto"

@UseGuards(JwtAuthGuard)
@Controller("v1/notifications")
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: AuthPayload) {
    return this.service.listNotifications(user.address)
  }

  @Post(":id/read")
  markAsRead(@Param("id") id: string, @CurrentUser() user: AuthPayload) {
    return this.service.markAsRead(id, user.address)
  }

  @Post("read-all")
  markAllRead(@CurrentUser() user: AuthPayload) {
    return this.service.markAllAsRead(user.address)
  }

  @Get("preferences")
  getPreferences(@CurrentUser() user: AuthPayload) {
    return this.service.getPreferences(user.address)
  }

  @Post("preferences")
  upsertPreferences(
    @CurrentUser() user: AuthPayload,
    @Body() payload: NotificationPreferencesDto
  ) {
    return this.service.upsertPreferences(user.address, payload)
  }
}
