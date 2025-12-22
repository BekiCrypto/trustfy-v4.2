import type { Abi, Address } from "viem"
import { TRUSTFY_ESCROW_ABI } from "../contracts/trustfyEscrow.config"
import { getContractAddress } from "./config"

export const selectEscrowAddress = (chainId: number): Address | undefined => {
  const address = getContractAddress(chainId)
  if (!address) return undefined
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return undefined
  }
  return address as Address
}

export const escrowAbi = TRUSTFY_ESCROW_ABI as Abi
