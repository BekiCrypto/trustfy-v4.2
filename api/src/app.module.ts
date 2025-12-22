import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { AuthModule } from "./modules/auth/auth.module"
import { RbacModule } from "./modules/rbac/rbac.module"
import { IndexerModule } from "./modules/indexer/indexer.module"
import { EscrowReadModule } from "./modules/escrow-read/escrow-read.module"
import { CoordinationModule } from "./modules/coordination/coordination.module"
import { EvidenceModule } from "./modules/evidence/evidence.module"
import { DisputeModule } from "./modules/dispute/dispute.module"
import { AdminModule } from "./modules/admin/admin.module"
import { NotificationsModule } from "./modules/notifications/notifications.module"
import { HealthModule } from "./modules/health/health.module"
import { PrismaModule } from "./modules/prisma/prisma.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
      expandVariables: true,
    }),
    PrismaModule,
    AuthModule,
    RbacModule,
    IndexerModule,
    EscrowReadModule,
    CoordinationModule,
    EvidenceModule,
    DisputeModule,
    AdminModule,
    NotificationsModule,
    HealthModule,
  ],
})
export class AppModule {}
