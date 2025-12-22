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
exports.DisputeController = void 0;
const common_1 = require("@nestjs/common");
const dispute_service_1 = require("./dispute.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../rbac/decorators/roles.decorator");
const roles_guard_1 = require("../rbac/guards/roles.guard");
const open_dispute_dto_1 = require("./dto/open-dispute.dto");
const recommendation_dto_1 = require("./dto/recommendation.dto");
const resolve_dispute_dto_1 = require("./dto/resolve-dispute.dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let DisputeController = class DisputeController {
    service;
    constructor(service) {
        this.service = service;
    }
    open(escrowId, payload, user) {
        return this.service.openDispute(escrowId, payload, user);
    }
    list(status) {
        return this.service.listDisputes(status);
    }
    detail(escrowId) {
        return this.service.getDispute(escrowId);
    }
    recommend(escrowId, payload, user) {
        return this.service.addRecommendation(escrowId, payload, user);
    }
    resolve(escrowId, payload, user) {
        return this.service.resolveDispute(escrowId, payload, user);
    }
};
exports.DisputeController = DisputeController;
__decorate([
    (0, common_1.Post)("escrows/:escrowId/dispute/open"),
    __param(0, (0, common_1.Param)("escrowId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, open_dispute_dto_1.OpenDisputeDto, Object]),
    __metadata("design:returntype", void 0)
], DisputeController.prototype, "open", null);
__decorate([
    (0, roles_decorator_1.Roles)("ADMIN", "ARBITRATOR"),
    (0, common_1.Get)("disputes"),
    __param(0, (0, common_1.Query)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisputeController.prototype, "list", null);
__decorate([
    (0, roles_decorator_1.Roles)("ADMIN", "ARBITRATOR"),
    (0, common_1.Get)("disputes/:escrowId"),
    __param(0, (0, common_1.Param)("escrowId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisputeController.prototype, "detail", null);
__decorate([
    (0, roles_decorator_1.Roles)("ADMIN", "ARBITRATOR"),
    (0, common_1.Post)("disputes/:escrowId/recommendation"),
    __param(0, (0, common_1.Param)("escrowId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, recommendation_dto_1.RecommendationDto, Object]),
    __metadata("design:returntype", void 0)
], DisputeController.prototype, "recommend", null);
__decorate([
    (0, roles_decorator_1.Roles)("ARBITRATOR"),
    (0, common_1.Post)("disputes/:escrowId/resolve"),
    __param(0, (0, common_1.Param)("escrowId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, resolve_dispute_dto_1.ResolveDisputeDto, Object]),
    __metadata("design:returntype", void 0)
], DisputeController.prototype, "resolve", null);
exports.DisputeController = DisputeController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)("v1"),
    __metadata("design:paramtypes", [dispute_service_1.DisputeService])
], DisputeController);
//# sourceMappingURL=dispute.controller.js.map