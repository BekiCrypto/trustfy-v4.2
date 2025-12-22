import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import type { AuthPayload } from "../types/auth-payload"

export const CurrentUser = createParamDecorator(
  (data: keyof AuthPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{
      user?: AuthPayload
    }>()
    if (!request.user) {
      return null
    }
    if (!data) {
      return request.user
    }
    return request.user[data]
  }
)
