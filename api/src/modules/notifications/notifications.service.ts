import { Injectable, OnModuleDestroy } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Queue } from "bullmq"
import { NotificationEvent } from "./types/notification-event"
import axios from "axios"
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class NotificationsService implements OnModuleDestroy {
  private readonly queue: Queue
  private readonly webhookUrl?: string
  private readonly webhookToken?: string

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    const redisUrl = this.configService.get<string>("REDIS_URL")
    if (!redisUrl) {
      throw new Error("REDIS_URL is required for notifications")
    }

    this.queue = new Queue("trustfy-notifications", {
      connection: { url: redisUrl },
    })

    this.webhookUrl = this.configService.get<string>("NOTIFICATIONS_URL")
    this.webhookToken = this.configService.get<string>("NOTIFICATIONS_INTERNAL_TOKEN")
  }

  async queueEvent(event: NotificationEvent) {
    await this.queue.add("webhook", event, {
      removeOnComplete: true,
      removeOnFail: 200,
    })
    await this.dispatch(event)
  }

  private async dispatch(event: NotificationEvent) {
    if (!this.webhookUrl) {
      return
    }

    try {
      await axios.post(this.webhookUrl, event, {
        headers: this.webhookToken
          ? {
              Authorization: `Bearer ${this.webhookToken}`,
            }
          : undefined,
      })
    } catch (error) {
      console.error("failed to dispatch notification", error)
    }
  }

  async onModuleDestroy() {
    await this.queue.close()
  }

  async getPreferences(address: string) {
    return this.prisma.notificationPreference.findUnique({
      where: { address },
    })
  }

  async upsertPreferences(address: string, payload: {
    webhookUrl?: string
    email?: string
    telegramId?: string
    smsNumber?: string
  }) {
    return this.prisma.notificationPreference.upsert({
      where: { address },
      create: {
        address,
        webhookUrl: payload.webhookUrl,
        email: payload.email,
        telegramId: payload.telegramId,
        smsNumber: payload.smsNumber,
      },
      update: {
        webhookUrl: payload.webhookUrl,
        email: payload.email,
        telegramId: payload.telegramId,
        smsNumber: payload.smsNumber,
      },
    })
  }
}
