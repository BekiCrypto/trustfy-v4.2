import { Module } from "@nestjs/common"
import { DisputeController } from "./dispute.controller"
import { DisputeService } from "./dispute.service"
import { NotificationsModule } from "../notifications/notifications.module"
import { RbacModule } from "../rbac/rbac.module"

@Module({
  imports: [NotificationsModule, RbacModule],
  controllers: [DisputeController],
  providers: [DisputeService],
})
export class DisputeModule {}
