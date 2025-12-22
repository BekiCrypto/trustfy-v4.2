import { IsOptional, IsString, MaxLength } from "class-validator"

export class FiatStatusDto {
  @IsString()
  status!: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string
}
