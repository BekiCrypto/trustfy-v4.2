import { IsNumber, IsOptional, IsString, IsNotEmpty, Min } from "class-validator"

export class EvidenceCommitDto {
  @IsString()
  @IsNotEmpty()
  key!: string

  @IsOptional()
  @IsString()
  uri?: string

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
