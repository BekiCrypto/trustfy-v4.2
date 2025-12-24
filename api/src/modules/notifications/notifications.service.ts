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
    // Persist notification
    try {
      await this.prisma.notification.create({
        data: {
          address: event.userAddress,
          type: event.type,
          title: event.title,
          message: event.message,
          link: event.link,
          metadata: event.metadata as any,
        }
      })
    } catch (e) {
      console.error("Failed to persist notification", e)
    }

    await this.queue.add("webhook", event, {
      removeOnComplete: true,
      removeOnFail: 200,
    })
    await this.dispatch(event)
  }

  async listNotifications(address: string, limit = 50) {
    return this.prisma.notification.findMany({
      where: { address },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  }

  async markAsRead(id: string, address: string) {
    return this.prisma.notification.updateMany({
      where: { id, address },
      data: { read: true },
    })
  }
  
  async markAllAsRead(address: string) {
    return this.prisma.notification.updateMany({
      where: { address, read: false },
      data: { read: true },
    })
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
    telegramId?: string
  }) {
    return this.prisma.notificationPreference.upsert({
      where: { address },
      create: {
        address,
        webhookUrl: payload.webhookUrl,
        telegramId: payload.telegramId,
      },
      update: {
        webhookUrl: payload.webhookUrl,
        telegramId: payload.telegramId,
      },
    })
  }
}
