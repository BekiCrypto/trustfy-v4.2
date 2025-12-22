var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../rbac/guards/roles.guard";
import { Roles } from "../rbac/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AdminWithdrawDto } from "./dto/withdraw.dto";
import { AdminRoleDto } from "./dto/admin-role.dto";
import { AdminTokenDto } from "./dto/admin-token.dto";
let AdminController = class AdminController {
    service;
    constructor(service) {
        this.service = service;
    }
    listPools(tokenKey) {
        return this.service.listPools(tokenKey);
    }
    withdraw(payload, user) {
        return this.service.recordWithdraw(payload, user);
    }
    addArbitrator(payload, user) {
        return this.service.addArbitrator(payload, user);
    }
    addAdmin(payload, user) {
        return this.service.addAdmin(payload, user);
    }
    listTokens(chainId, tokenKey) {
        const parsed = chainId ? Number(chainId) : undefined;
        return this.service.listTokens(parsed, tokenKey);
    }
    upsertToken(payload, user) {
        return this.service.upsertToken(payload, user);
    }
};
__decorate([
    Get("pools"),
    __param(0, Query("tokenKey")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listPools", null);
__decorate([
    Post("withdraw"),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AdminWithdrawDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "withdraw", null);
__decorate([
    Post("roles/arbitrators"),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AdminRoleDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "addArbitrator", null);
__decorate([
    Post("roles/admins"),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AdminRoleDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "addAdmin", null);
__decorate([
    Get("tokens"),
    __param(0, Query("chainId")),
    __param(1, Query("tokenKey")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listTokens", null);
__decorate([
    Post("tokens"),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AdminTokenDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "upsertToken", null);
AdminController = __decorate([
    Roles("ADMIN"),
    UseGuards(JwtAuthGuard, RolesGuard),
    Controller("v1/admin"),
    __metadata("design:paramtypes", [AdminService])
], AdminController);
export { AdminController };
//# sourceMappingURL=admin.controller.js.map