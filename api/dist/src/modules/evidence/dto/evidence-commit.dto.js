var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsNumber, IsOptional, IsString, IsNotEmpty, Min } from "class-validator";
export class EvidenceCommitDto {
    key;
    uri;
    mime;
    size;
    sha256;
    description;
}
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], EvidenceCommitDto.prototype, "key", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], EvidenceCommitDto.prototype, "uri", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], EvidenceCommitDto.prototype, "mime", void 0);
__decorate([
    IsNumber(),
    Min(1),
    __metadata("design:type", Number)
], EvidenceCommitDto.prototype, "size", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], EvidenceCommitDto.prototype, "sha256", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], EvidenceCommitDto.prototype, "description", void 0);
//# sourceMappingURL=evidence-commit.dto.js.map