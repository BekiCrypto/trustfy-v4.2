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
import { CoordinationService } from "./coordination.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CreateMessageDto } from "./dto/create-message.dto";
import { PaymentInstructionDto } from "./dto/payment-instruction.dto";
import { FiatStatusDto } from "./dto/fiat-status.dto";
let CoordinationController = class CoordinationController {
    service;
    constructor(service) {
        this.service = service;
    }
    listMessages(escrowId, user) {
        return this.service.listMessages(escrowId, user);
    }
    createMessage(escrowId, payload, user) {
        return this.service.createMessage(escrowId, payload, user);
    }
    paymentInstructions(escrowId, user) {
        return this.service.getPaymentInstructions(escrowId, user);
    }
    updatePaymentInstructions(escrowId, payload, user) {
        return this.service.updatePaymentInstructions(escrowId, payload, user);
    }
    recordFiatStatus(escrowId, payload, user) {
        return this.service.recordFiatStatus(escrowId, payload, user);
    }
};
__decorate([
    Get(":escrowId/messages"),
    __param(0, Param("escrowId")),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CoordinationController.prototype, "listMessages", null);
__decorate([
    Post(":escrowId/messages"),
    __param(0, Param("escrowId")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateMessageDto, Object]),
    __metadata("design:returntype", void 0)
], CoordinationController.prototype, "createMessage", null);
__decorate([
    Get(":escrowId/payment-instructions"),
    __param(0, Param("escrowId")),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CoordinationController.prototype, "paymentInstructions", null);
__decorate([
    Post(":escrowId/payment-instructions"),
    __param(0, Param("escrowId")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, PaymentInstructionDto, Object]),
    __metadata("design:returntype", void 0)
], CoordinationController.prototype, "updatePaymentInstructions", null);
__decorate([
    Post(":escrowId/fiat-status"),
    __param(0, Param("escrowId")),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, FiatStatusDto, Object]),
    __metadata("design:returntype", void 0)
], CoordinationController.prototype, "recordFiatStatus", null);
CoordinationController = __decorate([
    UseGuards(JwtAuthGuard),
    Controller("v1/escrows"),
    __metadata("design:paramtypes", [CoordinationService])
], CoordinationController);
export { CoordinationController };
//# sourceMappingURL=coordination.controller.js.map