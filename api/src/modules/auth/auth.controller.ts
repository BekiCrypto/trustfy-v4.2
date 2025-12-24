import { Body, Controller, Post, UseGuards, Get, Res } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { CreateNonceDto } from "./dto/create-nonce.dto"
import { LoginDto } from "./dto/login.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { CurrentUser } from "./decorators/current-user.decorator"
import { AuthPayload } from "./types/auth-payload"

@Controller("v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("nonce")
  async createNonce(@Body() payload: CreateNonceDto) {
    return this.authService.createNonce(payload)
  }

  @Post("login")
  async login(@Body() payload: LoginDto) {
    return this.authService.login(payload)
  }

  @Post("logout")
  async logout(@Res() res) {
    res.clearCookie("access_token")
    return res.send({ success: true })
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@CurrentUser() user: AuthPayload) {
    return this.authService.getProfile(user.address)
  }
}
