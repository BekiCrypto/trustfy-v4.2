import { Body, Controller, Post, UseGuards } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { CreateNonceDto } from "./dto/create-nonce.dto"
import { LoginDto } from "./dto/login.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { CurrentUser } from "./decorators/current-user.decorator"

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
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser("address") address: string) {
    await this.authService.logout(address)
    return { success: true }
  }
}
