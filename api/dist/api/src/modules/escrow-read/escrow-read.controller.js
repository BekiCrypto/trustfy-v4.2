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
exports.EscrowReadController = void 0;
const common_1 = require("@nestjs/common");
const escrow_read_service_1 = require("./escrow-read.service");
const query_escrows_dto_1 = require("./dto/query-escrows.dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const optional_jwt_auth_guard_1 = require("../auth/guards/optional-jwt-auth.guard");
let EscrowReadController = class EscrowReadController {
    service;
    constructor(service) {
        this.service = service;
    }
    async list(query, address) {
        return this.service.list(query, address);
    }
    detail(escrowId, user) {
        return this.service.getDetail(escrowId, user);
    }
    timeline(escrowId, user) {
        return this.service.getTimeline(escrowId, user);
    }
    participants(escrowId, user) {
        return this.service.getParticipants(escrowId, user);
    }
};
exports.EscrowReadController = EscrowReadController;
__decorate([
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)("address")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_escrows_dto_1.QueryEscrowsDto, String]),
    __metadata("design:returntype", Promise)
], EscrowReadController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(":escrowId"),
    __param(0, (0, common_1.Param)("escrowId")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EscrowReadController.prototype, "detail", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(":escrowId/timeline"),
    __param(0, (0, common_1.Param)("escrowId")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EscrowReadController.prototype, "timeline", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(":escrowId/participants"),
    __param(0, (0, common_1.Param)("escrowId")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EscrowReadController.prototype, "participants", null);
exports.EscrowReadController = EscrowReadController = __decorate([
    (0, common_1.Controller)("v1/escrows"),
    __metadata("design:paramtypes", [escrow_read_service_1.EscrowReadService])
], EscrowReadController);
//# sourceMappingURL=escrow-read.controller.js.map