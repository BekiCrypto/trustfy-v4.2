import { Module } from "@nestjs/common"
import { CoordinationController } from "./coordination.controller"
import { CoordinationService } from "./coordination.service"
import { NotificationsModule } from "../notifications/notifications.module"

@Module({
  imports: [NotificationsModule],
  controllers: [CoordinationController],
  providers: [CoordinationService],
})
export class CoordinationModule {}
