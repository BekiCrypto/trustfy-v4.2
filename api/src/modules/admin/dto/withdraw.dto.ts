import {
  IsEthereumAddress,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from "class-validator"

const DECIMAL_PATTERN = /^\d+(\.\d+)?$/

export class AdminWithdrawDto {
  @IsInt()
  @Min(0)
  chainId!: number

  @IsEthereumAddress()
  tokenKey!: string

  @IsOptional()
  @IsString()
  @Matches(DECIMAL_PATTERN)
  feeAmount?: string

  @IsOptional()
  @IsString()
  @Matches(DECIMAL_PATTERN)
  bondAmount?: string
}
