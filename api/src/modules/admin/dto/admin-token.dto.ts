import {
  IsBoolean,
  IsEthereumAddress,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator"

export class AdminTokenDto {
  @IsInt()
  @Min(0)
  chainId!: number

  @IsEthereumAddress()
  tokenKey!: string

  @IsString()
  symbol!: string

  @IsString()
  name!: string

  @IsInt()
  @Min(0)
  decimals!: number

  @IsOptional()
  @IsBoolean()
  enabled?: boolean
}
