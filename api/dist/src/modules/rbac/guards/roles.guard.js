var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ForbiddenException, Injectable, } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../rbac.constants";
import { RbacService } from "../rbac.service";
let RolesGuard = class RolesGuard {
    reflector;
    rbacService;
    constructor(reflector, rbacService) {
        this.reflector = reflector;
        this.rbacService = rbacService;
    }
    async canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) ?? [];
        if (!requiredRoles.length) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new ForbiddenException("Authentication required");
        }
        const roles = await this.rbacService.getRoles(user.address);
        request.user = { ...user, roles };
        const hasRole = requiredRoles.some((role) => roles.includes(role));
        if (!hasRole) {
            throw new ForbiddenException("Insufficient permissions");
        }
        return true;
    }
};
RolesGuard = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Reflector,
        RbacService])
], RolesGuard);
export { RolesGuard };
//# sourceMappingURL=roles.guard.js.map