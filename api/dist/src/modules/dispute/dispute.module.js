var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from "@nestjs/common";
import { DisputeController } from "./dispute.controller";
import { DisputeService } from "./dispute.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { RbacModule } from "../rbac/rbac.module";
let DisputeModule = class DisputeModule {
};
DisputeModule = __decorate([
    Module({
        imports: [NotificationsModule, RbacModule],
        controllers: [DisputeController],
        providers: [DisputeService],
    })
], DisputeModule);
export { DisputeModule };
//# sourceMappingURL=dispute.module.js.map