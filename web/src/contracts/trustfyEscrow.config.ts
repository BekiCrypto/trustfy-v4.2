import escrowAbiJson from "@trustfy/shared/contracts/TrustfyEscrowV4_2_Amended_ABI.json"
import { CONTRACT_ADDRESSES as ENV_CONTRACT_ADDRESSES } from "../lib/config"
import type { Abi } from "viem"

const DEFAULT_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 97)
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

const DEFAULT_ESCROW_ADDRESSES: Record<number, string> = {
  97: "0x954BD1961906C90B65B4AF63539ab1dc6789e25a",
}

const DEFAULT_TOKEN_ADDRESSES: Record<number, Record<string, string>> = {
  97: {
    USDT: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
    USDC: "0x64544969ed7ebf5f083679233325356ebe738930",
    BUSD: "0x8301f2213c0eed49a7e28ae4c3e91722919b8b47",
    BNB: ZERO_ADDRESS,
  },
  56: {
    USDT: "0x55d398326f99059ff775485246999027b3197955",
    USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    BUSD: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    BNB: ZERO_ADDRESS,
  },
}

const escrowAbiArray = Array.isArray(escrowAbiJson)
  ? escrowAbiJson
  : (() => {
      const abiHash = (escrowAbiJson as { transactions?: { record?: { abi?: string } }[] })
        .transactions?.[0]?.record?.abi
      return abiHash
        ? (escrowAbiJson as { abis?: Record<string, Abi> }).abis?.[abiHash]
        : undefined
    })()

export const TRUSTFY_ESCROW_ABI = (escrowAbiArray ?? []) as Abi

export const TRUSTFY_ESCROW_ADDRESSES: Record<number, string> = {
  ...DEFAULT_ESCROW_ADDRESSES,
  ...ENV_CONTRACT_ADDRESSES,
}

export const TRUSTFY_ESCROW_TOKEN_ADDRESSES = DEFAULT_TOKEN_ADDRESSES

export const TRUSTFY_ESCROW_CHAINS = {
  BSC: DEFAULT_CHAIN_ID,
  BSC_TESTNET: 97,
  BSC_MAINNET: 56,
} as const

export const TRUSTFY_ESCROW_EXPLORERS: Record<number, string> = {
  56: "https://bscscan.com",
  97: "https://testnet.bscscan.com",
}
