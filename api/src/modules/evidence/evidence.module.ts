import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { EvidenceController } from "./evidence.controller"
import { EvidenceService } from "./evidence.service"
import { NotificationsModule } from "../notifications/notifications.module"

@Module({
  imports: [ConfigModule, NotificationsModule],
  controllers: [EvidenceController],
  providers: [EvidenceService],
})
export class EvidenceModule {}
