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
exports.CoordinationController = void 0;
const common_1 = require("@nestjs/common");
const coordination_service_1 = require("./coordination.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const create_message_dto_1 = require("./dto/create-message.dto");
const payment_instruction_dto_1 = require("./dto/payment-instruction.dto");
const fiat_status_dto_1 = require("./dto/fiat-status.dto");
let CoordinationController = class CoordinationController {
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
exports.CoordinationController = CoordinationController;
__decorate([
    (0, common_1.Get)(":escrowId/messages"),
    __param(0, (0, common_1.Param)("escrowId")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CoordinationController.prototype, "listMessages", null);
__decorate([
    (0, common_1.Post)(":escrowId/messages"),
    __param(0, (0, common_1.Param)("escrowId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_message_dto_1.CreateMessageDto, Object]),
    __metadata("design:returntype", void 0)
], CoordinationController.prototype, "createMessage", null);
__decorate([
    (0, common_1.Get)(":escrowId/payment-instructions"),
    __param(0, (0, common_1.Param)("escrowId")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CoordinationController.prototype, "paymentInstructions", null);
__decorate([
    (0, common_1.Post)(":escrowId/payment-instructions"),
    __param(0, (0, common_1.Param)("escrowId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payment_instruction_dto_1.PaymentInstructionDto, Object]),
    __metadata("design:returntype", void 0)
], CoordinationController.prototype, "updatePaymentInstructions", null);
__decorate([
    (0, common_1.Post)(":escrowId/fiat-status"),
    __param(0, (0, common_1.Param)("escrowId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, fiat_status_dto_1.FiatStatusDto, Object]),
    __metadata("design:returntype", void 0)
], CoordinationController.prototype, "recordFiatStatus", null);
exports.CoordinationController = CoordinationController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("v1/escrows"),
    __metadata("design:paramtypes", [coordination_service_1.CoordinationService])
], CoordinationController);
