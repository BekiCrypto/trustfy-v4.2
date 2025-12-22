import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator"

export class EvidencePresignDto {
  @IsString()
  @IsNotEmpty()
  filename!: string

  @IsString()
  @IsNotEmpty()
  mime!: string

  @IsNumber()
  @Min(1)
  size!: number

  @IsString()
  @IsNotEmpty()
  sha256!: string

  @IsOptional()
  @IsString()
  description?: string
}
