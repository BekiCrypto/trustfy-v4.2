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
import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { EscrowReadService } from "./escrow-read.service";
import { QueryEscrowsDto } from "./dto/query-escrows.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard";
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
__decorate([
    UseGuards(OptionalJwtAuthGuard),
    Get(),
    __param(0, Query()),
    __param(1, CurrentUser("address")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QueryEscrowsDto, String]),
    __metadata("design:returntype", Promise)
], EscrowReadController.prototype, "list", null);
__decorate([
    UseGuards(JwtAuthGuard),
    Get(":escrowId"),
    __param(0, Param("escrowId")),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EscrowReadController.prototype, "detail", null);
__decorate([
    UseGuards(JwtAuthGuard),
    Get(":escrowId/timeline"),
    __param(0, Param("escrowId")),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EscrowReadController.prototype, "timeline", null);
__decorate([
    UseGuards(JwtAuthGuard),
    Get(":escrowId/participants"),
    __param(0, Param("escrowId")),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EscrowReadController.prototype, "participants", null);
EscrowReadController = __decorate([
    Controller("v1/escrows"),
    __metadata("design:paramtypes", [EscrowReadService])
], EscrowReadController);
export { EscrowReadController };
//# sourceMappingURL=escrow-read.controller.js.map