var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
let OptionalJwtAuthGuard = class OptionalJwtAuthGuard {
    jwtService;
    configService;
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const header = request.headers["authorization"];
        if (!header || Array.isArray(header) || !header.startsWith("Bearer ")) {
            return true;
        }
        const token = header.replace("Bearer ", "");
        try {
            const decoded = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get("JWT_SECRET"),
                clockTolerance: 30,
            });
            request.user = decoded;
        }
        catch {
            // allow requests to proceed even if token invalid
        }
        return true;
    }
};
OptionalJwtAuthGuard = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [JwtService,
        ConfigService])
], OptionalJwtAuthGuard);
export { OptionalJwtAuthGuard };
//# sourceMappingURL=optional-jwt-auth.guard.js.map