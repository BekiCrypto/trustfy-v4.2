import { IsEmail, IsOptional, IsString, IsUrl, MaxLength } from "class-validator"

export class NotificationPreferencesDto {
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  webhookUrl?: string

  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string

  @IsOptional()
  @IsString()
  @MaxLength(64)
  telegramId?: string

  @IsOptional()
  @IsString()
  @MaxLength(32)
  smsNumber?: string
}
