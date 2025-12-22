import { IsOptional, IsString, MaxLength } from "class-validator"

export class OpenDisputeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reasonCode?: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  summary?: string
}
