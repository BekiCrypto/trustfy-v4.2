import { IsOptional, IsString, IsUrl, MaxLength } from "class-validator"

export class NotificationPreferencesDto {
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  webhookUrl?: string

  @IsOptional()
  @IsString()
  @MaxLength(64)
  telegramId?: string
}
