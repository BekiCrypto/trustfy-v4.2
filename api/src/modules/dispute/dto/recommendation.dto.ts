import { IsOptional, IsString, MaxLength } from "class-validator"

export class RecommendationDto {
  @IsString()
  @MaxLength(1000)
  summary!: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string
}
