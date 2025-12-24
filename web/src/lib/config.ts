type ChainRecord = Record<number, string>

const defaultRpc: ChainRecord = {
  56: "https://bsc-dataseed.binance.org",
  97: "https://data-seed-prebsc-2-s1.binance.org:8545/",
}

const defaultContracts: ChainRecord = {}

const parseChainRecord = (value?: string): ChainRecord => {
  if (!value) return {}
  return value.split(",").reduce<ChainRecord>((acc, chunk) => {
    const [chainIdRaw, ...rest] = chunk.split(/[:=]/)
    const url = rest.join(":").trim()
    const chainId = Number(chainIdRaw?.trim())
    if (chainId && url) {
      acc[chainId] = url
    }
    return acc
  }, {})
}

const parseWalletList = (value?: string): Set<string> => {
  if (!value) return new Set()
  return new Set(
    value
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  )
}

export const RPC_URLS: ChainRecord = {
  ...defaultRpc,
  ...parseChainRecord(import.meta.env.VITE_RPC_URLS),
}

export const CONTRACT_ADDRESSES: ChainRecord = {
  ...defaultContracts,
  ...parseChainRecord(import.meta.env.VITE_CONTRACT_ADDRESS),
}

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000"

export const getRpcUrl = (chainId: number): string | undefined =>
  RPC_URLS[chainId]

export const getContractAddress = (chainId: number): string =>
  CONTRACT_ADDRESSES[chainId] ?? ""

export const BLOCK_EXPLORER_BASE =
  import.meta.env.VITE_BLOCK_EXPLORER_BASE ?? "https://bscscan.com"

export const TARGET_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 56)

export const ADMIN_WALLETS = parseWalletList(import.meta.env.VITE_ADMIN_WALLETS)
export const ARBITRATOR_WALLETS = parseWalletList(
  import.meta.env.VITE_ARBITRATOR_WALLETS
)

const DEFAULT_ADMIN_SET = new Set<string>([
  '0x2e303818319a6359a26af5ebfc50de01ed06d094',
])
const DEFAULT_ARBITRATOR_SET = new Set<string>([
  '0xe977252a68e714af1178f5036e488bf70a51a0de',
])

if (!ADMIN_WALLETS || ADMIN_WALLETS.size === 0) {
  DEFAULT_ADMIN_SET.forEach((a) => ADMIN_WALLETS.add(a))
}
if (!ARBITRATOR_WALLETS || ARBITRATOR_WALLETS.size === 0) {
  DEFAULT_ARBITRATOR_SET.forEach((a) => ARBITRATOR_WALLETS.add(a))
}
