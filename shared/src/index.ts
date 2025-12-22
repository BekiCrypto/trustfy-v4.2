export const ESCROW_STATES = [
  "CREATED",
  "TAKEN",
  "FUNDED",
  "PAYMENT_CONFIRMED",
  "DISPUTED",
  "RESOLVED",
  "CANCELLED",
] as const

export type EscrowState = (typeof ESCROW_STATES)[number]

export const DISPUTE_OUTCOMES = ["BUYER_WINS", "SELLER_WINS", "NONE"] as const

export type DisputeOutcome = (typeof DISPUTE_OUTCOMES)[number]

export interface EscrowSummary {
  escrowId: string
  chainId: number
  tokenKey: string
  amount: string
  feeAmount: string
  sellerBond: string
  buyerBond: string
  state: EscrowState
  seller: string
  buyer?: string
  updatedAtBlock: number
  updatedAt: string
}

export interface EscrowTimelineEntry {
  id: string
  escrowId: string
  eventName: string
  stateAfter: EscrowState
  txHash: string
  blockNumber: number
  logIndex: number
  timestamp: string
  payload: Record<string, unknown>
}

export interface CanonicalToken {
  chainId: number
  tokenKey: string
  symbol: string
  name: string
  decimals: number
  enabled: boolean
}

export interface EscrowDetail extends EscrowSummary {
  timeline: EscrowTimelineEntry[]
  paymentInstructions?: {
    contentJson: Record<string, unknown>
    updatedAt: string
  }
  participants: {
    seller: string
    buyer?: string
    arbitrator?: string
  }
  dispute?: {
    status: string
    outcome?: DisputeOutcome
  }
}

export interface DisputeSummary {
  escrowId: string
  status: string
  openedBy: string
  outcome?: DisputeOutcome
  summary?: string
  updatedAt: string
}

export interface MessageItem {
  id: string
  escrowId: string
  sender: string
  text: string
  attachmentUri?: string
  createdAt: string
}

export interface NotificationPreferences {
  address: string
  webhookUrl?: string
  email?: string
  telegramId?: string
  smsNumber?: string
}

export interface IndexerStatus {
  chainId: number
  contractAddress: string
  lastSyncedBlock: number
  lagBlocks: number
}

export interface AuthSession {
  address: string
  roles: string[]
  accessToken: string
  expiresAt?: string | null
}

export interface EvidenceEntry {
  id: string
  escrowId: string
  uploader: string
  uri: string
  sha256: string
  mime: string
  size: string
  description?: string
  createdAt: string
}

export interface PaymentInstruction {
  seller: string
  contentJson: Record<string, unknown>
  updatedAt: string
}

export interface DisputeDetail extends DisputeSummary {
  escrow?: {
    escrowId: string
    seller: string
    buyer?: string
    state: string
  }
}

export interface AdminPool {
  tokenKey: string
  feeAmount: string
  sellerBond: string
  buyerBond: string
}

export interface TokenRegistryEntry {
  chainId: number
  tokenKey: string
  symbol: string
  name: string
  decimals: number
  enabled: boolean
}
