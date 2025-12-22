import type { Abi, Address } from "viem"
import rawEscrowAbi from "../../../shared/src/contracts/TrustfyEscrowV4_2_Amended_ABI.json"
import { getContractAddress } from "./config"

export const selectEscrowAddress = (chainId: number): Address | undefined => {
  const address = getContractAddress(chainId)
  if (!address) return undefined
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return undefined
  }
  return address as Address
}

export const escrowAbi = rawEscrowAbi as Abi
