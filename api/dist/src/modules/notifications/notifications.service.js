var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue } from "bullmq";
import axios from "axios";
let NotificationsService = class NotificationsService {
    configService;
    queue;
    webhookUrl;
    webhookToken;
    constructor(configService) {
        this.configService = configService;
        const redisUrl = this.configService.get("REDIS_URL");
        if (!redisUrl) {
            throw new Error("REDIS_URL is required for notifications");
        }
        this.queue = new Queue("trustfy-notifications", {
            connection: { url: redisUrl },
        });
        this.webhookUrl = this.configService.get("NOTIFICATIONS_URL");
        this.webhookToken = this.configService.get("NOTIFICATIONS_INTERNAL_TOKEN");
    }
    async queueEvent(event) {
        await this.queue.add("webhook", event, {
            removeOnComplete: true,
            removeOnFail: 200,
        });
        await this.dispatch(event);
    }
    async dispatch(event) {
        if (!this.webhookUrl) {
            return;
        }
        try {
            await axios.post(this.webhookUrl, event, {
                headers: this.webhookToken
                    ? {
                        Authorization: `Bearer ${this.webhookToken}`,
                    }
                    : undefined,
            });
        }
        catch (error) {
            console.error("failed to dispatch notification", error);
        }
    }
    async onModuleDestroy() {
        await this.queue.close();
    }
};
NotificationsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], NotificationsService);
export { NotificationsService };
//# sourceMappingURL=notifications.service.js.map