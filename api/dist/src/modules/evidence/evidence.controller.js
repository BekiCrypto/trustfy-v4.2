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
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { EvidenceService } from "./evidence.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { EvidencePresignDto } from "./dto/evidence-presign.dto";
import { EvidenceCommitDto } from "./dto/evidence-commit.dto";
let EvidenceController = class EvidenceController {
    service;
    constructor(service) {
        this.service = service;
    }
    presign(escrowId, payload, user) {
        return this.service.presign(escrowId, payload, user);
    }
    commit(escrowId, payload, user) {
        return this.service.commit(escrowId, payload, user);
    }
    list(escrowId, user) {
        return this.service.list(escrowId, user);
    }
};
__decorate([
    Post("presign"),
    __param(0, Param("escrowId")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, EvidencePresignDto, Object]),
    __metadata("design:returntype", void 0)
], EvidenceController.prototype, "presign", null);
__decorate([
    Post("commit"),
    __param(0, Param("escrowId")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, EvidenceCommitDto, Object]),
    __metadata("design:returntype", void 0)
], EvidenceController.prototype, "commit", null);
__decorate([
    Get(),
    __param(0, Param("escrowId")),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EvidenceController.prototype, "list", null);
EvidenceController = __decorate([
    UseGuards(JwtAuthGuard),
    Controller("v1/escrows/:escrowId/evidence"),
    __metadata("design:paramtypes", [EvidenceService])
], EvidenceController);
export { EvidenceController };
//# sourceMappingURL=evidence.controller.js.map