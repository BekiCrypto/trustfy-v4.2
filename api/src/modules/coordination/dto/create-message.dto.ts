import { IsOptional, IsString, MaxLength, MinLength, IsUrl } from "class-validator"

export class CreateMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text!: string

  @IsOptional()
  @IsUrl()
  attachmentUri?: string
}
