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
exports.ReferralsController = void 0;
const common_1 = require("@nestjs/common");
const referrals_service_1 = require("./referrals.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ReferralsController = class ReferralsController {
    constructor(referrals) {
        this.referrals = referrals;
    }
    async dashboard(caller) {
        return this.referrals.getDashboard(caller);
    }
    async createCode(caller) {
        return this.referrals.createCode(caller);
    }
    async getConfig() {
        return this.referrals.getConfig();
    }
    async updateConfig(dto, caller) {
        return this.referrals.updateConfig(dto, caller);
    }
    async attribution(dto) {
        return this.referrals.attribution(dto.refCode, dto.refereeAddress);
    }
    async withdraw(dto, caller) {
        return this.referrals.withdraw(dto.amount, caller);
    }
    async transfer(dto, caller) {
        return this.referrals.transferToCredit(dto.amount, caller);
    }
    async getWalletTransactions(caller) {
        return this.referrals.getWalletTransactions(caller);
    }
};
exports.ReferralsController = ReferralsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("me/dashboard"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "dashboard", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("codes"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "createCode", null);
__decorate([
    (0, common_1.Get)("config"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "getConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("config"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Post)("attribution"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "attribution", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("withdraw"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "withdraw", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("transfer-to-credit"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "transfer", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("wallet/transactions"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "getWalletTransactions", null);
exports.ReferralsController = ReferralsController = __decorate([
    (0, common_1.Controller)("v1/referrals"),
    __metadata("design:paramtypes", [referrals_service_1.ReferralsService])
], ReferralsController);
