"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
const axios_1 = __importDefault(require("axios"));
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = class NotificationsService {
    configService;
    prisma;
    queue;
    webhookUrl;
    webhookToken;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        const redisUrl = this.configService.get("REDIS_URL");
        if (!redisUrl) {
            throw new Error("REDIS_URL is required for notifications");
        }
        this.queue = new bullmq_1.Queue("trustfy-notifications", {
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
            await axios_1.default.post(this.webhookUrl, event, {
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
    async getPreferences(address) {
        return this.prisma.notificationPreference.findUnique({
            where: { address },
        });
    }
    async upsertPreferences(address, payload) {
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
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map