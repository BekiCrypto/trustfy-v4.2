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
import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { DisputeService } from "./dispute.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../rbac/decorators/roles.decorator";
import { RolesGuard } from "../rbac/guards/roles.guard";
import { OpenDisputeDto } from "./dto/open-dispute.dto";
import { RecommendationDto } from "./dto/recommendation.dto";
import { ResolveDisputeDto } from "./dto/resolve-dispute.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
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
__decorate([
    Post("escrows/:escrowId/dispute/open"),
    __param(0, Param("escrowId")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, OpenDisputeDto, Object]),
    __metadata("design:returntype", void 0)
], DisputeController.prototype, "open", null);
__decorate([
    Roles("ADMIN", "ARBITRATOR"),
    Get("disputes"),
    __param(0, Query("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisputeController.prototype, "list", null);
__decorate([
    Roles("ADMIN", "ARBITRATOR"),
    Get("disputes/:escrowId"),
    __param(0, Param("escrowId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisputeController.prototype, "detail", null);
__decorate([
    Roles("ADMIN", "ARBITRATOR"),
    Post("disputes/:escrowId/recommendation"),
    __param(0, Param("escrowId")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RecommendationDto, Object]),
    __metadata("design:returntype", void 0)
], DisputeController.prototype, "recommend", null);
__decorate([
    Roles("ARBITRATOR"),
    Post("disputes/:escrowId/resolve"),
    __param(0, Param("escrowId")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ResolveDisputeDto, Object]),
    __metadata("design:returntype", void 0)
], DisputeController.prototype, "resolve", null);
DisputeController = __decorate([
    UseGuards(JwtAuthGuard, RolesGuard),
    Controller("v1"),
    __metadata("design:paramtypes", [DisputeService])
], DisputeController);
export { DisputeController };
//# sourceMappingURL=dispute.controller.js.map