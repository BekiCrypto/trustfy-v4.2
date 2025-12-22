import { createParamDecorator } from "@nestjs/common";
export const CurrentUser = createParamDecorator((data, context) => {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
        return null;
    }
    if (!data) {
        return request.user;
    }
    return request.user[data];
});
//# sourceMappingURL=current-user.decorator.js.map