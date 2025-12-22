"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./modules/auth/auth.module");
const rbac_module_1 = require("./modules/rbac/rbac.module");
const indexer_module_1 = require("./modules/indexer/indexer.module");
const escrow_read_module_1 = require("./modules/escrow-read/escrow-read.module");
const coordination_module_1 = require("./modules/coordination/coordination.module");
const evidence_module_1 = require("./modules/evidence/evidence.module");
const dispute_module_1 = require("./modules/dispute/dispute.module");
const admin_module_1 = require("./modules/admin/admin.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const health_module_1 = require("./modules/health/health.module");
const prisma_module_1 = require("./modules/prisma/prisma.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: [".env", ".env.local"],
                expandVariables: true,
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            rbac_module_1.RbacModule,
            indexer_module_1.IndexerModule,
            escrow_read_module_1.EscrowReadModule,
            coordination_module_1.CoordinationModule,
            evidence_module_1.EvidenceModule,
            dispute_module_1.DisputeModule,
            admin_module_1.AdminModule,
            notifications_module_1.NotificationsModule,
            health_module_1.HealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map