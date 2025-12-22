import { IsEthereumAddress } from "class-validator"

export class AdminRoleDto {
  @IsEthereumAddress()
  address!: string
}
