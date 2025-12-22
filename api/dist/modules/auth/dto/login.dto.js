var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsEthereumAddress, IsString, MinLength } from "class-validator";
export class LoginDto {
    address;
    signature;
    nonce;
}
__decorate([
    IsEthereumAddress(),
    __metadata("design:type", String)
], LoginDto.prototype, "address", void 0);
__decorate([
    IsString(),
    MinLength(10),
    __metadata("design:type", String)
], LoginDto.prototype, "signature", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], LoginDto.prototype, "nonce", void 0);
//# sourceMappingURL=login.dto.js.map