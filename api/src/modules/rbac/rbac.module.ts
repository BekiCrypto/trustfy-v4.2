import { Module } from "@nestjs/common"
import { RbacController } from "./rbac.controller"
import { RbacService } from "./rbac.service"
import { RolesGuard } from "./guards/roles.guard"

@Module({
  controllers: [RbacController],
  providers: [RbacService, RolesGuard],
  exports: [RbacService, RolesGuard],
})
export class RbacModule {}
