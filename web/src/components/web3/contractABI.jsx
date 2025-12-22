import { RPC_URLS as ENV_RPC_URLS } from "../../lib/config"
import {
  TRUSTFY_ESCROW_ABI,
  TRUSTFY_ESCROW_ADDRESSES,
  TRUSTFY_ESCROW_CHAINS,
  TRUSTFY_ESCROW_EXPLORERS,
  TRUSTFY_ESCROW_TOKEN_ADDRESSES,
} from "../../contracts/trustfyEscrow.config"

export const ESCROW_ABI = TRUSTFY_ESCROW_ABI

const buildAddresses = (chainId) => ({
  escrow: TRUSTFY_ESCROW_ADDRESSES[chainId] ?? "",
  ...(TRUSTFY_ESCROW_TOKEN_ADDRESSES[chainId] ?? {}),
})

export const CONTRACT_ADDRESSES = {
  BSC: buildAddresses(TRUSTFY_ESCROW_CHAINS.BSC),
  BSC_TESTNET: buildAddresses(TRUSTFY_ESCROW_CHAINS.BSC_TESTNET),
  BSC_MAINNET: buildAddresses(TRUSTFY_ESCROW_CHAINS.BSC_MAINNET),
}

export const CHAIN_IDS = {
  BSC: TRUSTFY_ESCROW_CHAINS.BSC,
  BSC_TESTNET: TRUSTFY_ESCROW_CHAINS.BSC_TESTNET,
  BSC_MAINNET: TRUSTFY_ESCROW_CHAINS.BSC_MAINNET,
}

export const RPC_URLS = {
  BSC: ENV_RPC_URLS[CHAIN_IDS.BSC],
  BSC_TESTNET: ENV_RPC_URLS[CHAIN_IDS.BSC_TESTNET],
  BSC_MAINNET: ENV_RPC_URLS[CHAIN_IDS.BSC_MAINNET],
}

export const EXPLORERS = {
  BSC: TRUSTFY_ESCROW_EXPLORERS[CHAIN_IDS.BSC],
  BSC_TESTNET: TRUSTFY_ESCROW_EXPLORERS[CHAIN_IDS.BSC_TESTNET],
  BSC_MAINNET: TRUSTFY_ESCROW_EXPLORERS[CHAIN_IDS.BSC_MAINNET],
}

export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
]

export const SUPPORTED_TOKENS = ["USDT", "USDC", "BUSD", "BNB"]
