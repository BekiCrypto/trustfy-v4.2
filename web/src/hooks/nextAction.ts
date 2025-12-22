import type { EscrowDetail, EscrowState } from "@trustfy/shared"

export type WalletRole = "USER" | "ARBITRATOR" | "ADMIN"

export interface NextAction {
  id: string
  label: string
  type?: "primary" | "secondary" | "danger"
  requires?: WalletRole[]
  disabled?: boolean
}

export interface NextActionContext {
  escrow?: EscrowDetail
  state?: EscrowState
  walletAddress?: string | null
  roles: WalletRole[]
}

const includesRole = (roles: WalletRole[], target: WalletRole) =>
  roles.includes(target)

export const computeNextActions = ({
  escrow,
  state,
  walletAddress,
  roles,
}: NextActionContext): NextAction[] => {
  if (!escrow || !state) return []

  const normalizedWallet = walletAddress?.toLowerCase()
  const seller = escrow.seller.toLowerCase()
  const buyer = escrow.buyer?.toLowerCase() ?? ""

  const isSeller = normalizedWallet === seller
  const isBuyer = normalizedWallet === buyer
  const isAdmin = includesRole(roles, "ADMIN")
  const isArbitrator = includesRole(roles, "ARBITRATOR")

  const actions: NextAction[] = []

  switch (state) {
    case "CREATED":
      if (isBuyer) {
        actions.push({ id: "take", label: "Take Escrow", type: "primary" })
      }
      break
    case "TAKEN":
      if (isSeller) {
        actions.push({ id: "fund", label: "Fund Escrow", type: "primary" })
      }
      if (isBuyer) {
        actions.push({
          id: "dispute",
          label: "Open Dispute",
          type: "danger",
        })
      }
      break
    case "FUNDED":
      if (isBuyer) {
        actions.push({ id: "confirm", label: "Confirm Payment", type: "primary" })
      }
      if (isArbitrator) {
        actions.push({ id: "dispute", label: "Open Dispute", type: "danger" })
      }
      break
    case "PAYMENT_CONFIRMED":
      if (isSeller) {
        actions.push({ id: "release", label: "Release Escrow", type: "primary" })
      }
      if (isBuyer || isSeller) {
        actions.push({ id: "dispute", label: "Open Dispute", type: "danger" })
      }
      break
    case "DISPUTED":
      if (isArbitrator) {
        actions.push({ id: "resolve", label: "Resolve Dispute", type: "primary" })
      }
      break
    default:
      break
  }

  if (isAdmin) {
    actions.push({
      id: "withdraw",
      label: "Withdraw Platform Funds",
      type: "secondary",
    })
  }

  return actions
}
