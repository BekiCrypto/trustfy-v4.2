import { IsEnum, IsOptional, IsString } from "class-validator"

export const RESOLUTION_OUTCOMES = ["BUYER_WINS", "SELLER_WINS"] as const

export class ResolveDisputeDto {
  @IsEnum(RESOLUTION_OUTCOMES)
  outcome!: (typeof RESOLUTION_OUTCOMES)[number]

  @IsOptional()
  @IsString()
  ref?: string
}
