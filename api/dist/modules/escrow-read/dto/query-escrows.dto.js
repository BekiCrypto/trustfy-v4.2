var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Type } from "class-transformer";
import { IsIn, IsOptional, IsPositive, IsString } from "class-validator";
import { ESCROW_STATES } from "@trustfy/shared";
export class QueryEscrowsDto {
    status;
    tokenKey;
    role;
    page = 1;
    pageSize = 20;
}
__decorate([
    IsOptional(),
    IsIn(ESCROW_STATES),
    __metadata("design:type", Object)
], QueryEscrowsDto.prototype, "status", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], QueryEscrowsDto.prototype, "tokenKey", void 0);
__decorate([
    IsOptional(),
    IsIn(["seller", "buyer"]),
    __metadata("design:type", String)
], QueryEscrowsDto.prototype, "role", void 0);
__decorate([
    IsOptional(),
    Type(() => Number),
    IsPositive(),
    __metadata("design:type", Number)
], QueryEscrowsDto.prototype, "page", void 0);
__decorate([
    IsOptional(),
    Type(() => Number),
    IsPositive(),
    __metadata("design:type", Number)
], QueryEscrowsDto.prototype, "pageSize", void 0);
//# sourceMappingURL=query-escrows.dto.js.map