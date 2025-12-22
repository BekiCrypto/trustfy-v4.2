import { IsEthereumAddress, IsString, MinLength } from "class-validator"

export class LoginDto {
  @IsEthereumAddress()
  address!: string

  @IsString()
  @MinLength(10)
  signature!: string

  @IsString()
  nonce!: string
}
