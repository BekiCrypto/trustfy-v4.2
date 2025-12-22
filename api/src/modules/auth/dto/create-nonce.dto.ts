import { IsEthereumAddress, IsInt, IsOptional, IsString, Min } from "class-validator"

export class CreateNonceDto {
  @IsEthereumAddress()
  address!: string

  @IsInt()
  @Min(1)
  chainId!: number

  @IsOptional()
  @IsString()
  domain?: string
}
