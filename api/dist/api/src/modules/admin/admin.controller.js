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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const withdraw_dto_1 = require("./dto/withdraw.dto");
const admin_role_dto_1 = require("./dto/admin-role.dto");
const admin_token_dto_1 = require("./dto/admin-token.dto");
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
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)("pools"),
    __param(0, (0, common_1.Query)("tokenKey")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listPools", null);
__decorate([
    (0, common_1.Post)("withdraw"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [withdraw_dto_1.AdminWithdrawDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Post)("roles/arbitrators"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_role_dto_1.AdminRoleDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "addArbitrator", null);
__decorate([
    (0, common_1.Post)("roles/admins"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_role_dto_1.AdminRoleDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "addAdmin", null);
__decorate([
    (0, common_1.Get)("tokens"),
    __param(0, (0, common_1.Query)("chainId")),
    __param(1, (0, common_1.Query)("tokenKey")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listTokens", null);
__decorate([
    (0, common_1.Post)("tokens"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_token_dto_1.AdminTokenDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "upsertToken", null);
exports.AdminController = AdminController = __decorate([
    (0, roles_decorator_1.Roles)("ADMIN"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)("v1/admin"),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map