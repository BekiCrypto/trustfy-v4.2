import { Type } from "class-transformer"
import { IsIn, IsOptional, IsPositive, IsString } from "class-validator"
import { ESCROW_STATES } from "@trustfy/shared"

export class QueryEscrowsDto {
  @IsOptional()
  @IsIn(ESCROW_STATES)
  status?: (typeof ESCROW_STATES)[number]

  @IsOptional()
  @IsString()
  tokenKey?: string

  @IsOptional()
  @IsIn(["seller", "buyer"])
  role?: "seller" | "buyer"

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  pageSize?: number = 20
}
