/**
 * Escrow lifecycle states
 * This is the SINGLE source of truth.
 */
export const ESCROW_STATES = [
  "CREATED",
  "TAKEN",
  "FUNDED",
  "PAYMENT_CONFIRMED",
  "DISPUTED",
  "RESOLVED",
  "CANCELLED",
] as const

export type EscrowState = typeof ESCROW_STATES[number]

/**
 * Dispute resolution outcomes
 */
export const DISPUTE_OUTCOMES = [
  "BUYER_WINS",
  "SELLER_WINS",
  "NONE",
] as const

export type DisputeOutcome = typeof DISPUTE_OUTCOMES[number]

/**
 * Timeline / message item used by API + UI
 * (matches what escrow-read & coordination services expect)
 */
export interface MessageItem {
  id: string
  escrowId: string
  sender: string
  content: string
  createdAt: string
}

/**
 * Escrow summary returned to UI lists
 */
export interface EscrowSummary {
  escrowId: string
  chainId: number
  state: EscrowState
  buyer: string
  seller: string
  amount: string
  tokenKey: string
  updatedAt: string
}

/**
 * Dispute summary contract
 */
export interface DisputeSummary {
  escrowId: string
  status: EscrowState
  openedBy: string
  summary: string
  updatedAt: string
}
