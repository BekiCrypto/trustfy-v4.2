var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { RbacModule } from "./modules/rbac/rbac.module";
import { IndexerModule } from "./modules/indexer/indexer.module";
import { EscrowReadModule } from "./modules/escrow-read/escrow-read.module";
import { CoordinationModule } from "./modules/coordination/coordination.module";
import { EvidenceModule } from "./modules/evidence/evidence.module";
import { DisputeModule } from "./modules/dispute/dispute.module";
import { AdminModule } from "./modules/admin/admin.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { HealthModule } from "./modules/health/health.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ".env",
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
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map