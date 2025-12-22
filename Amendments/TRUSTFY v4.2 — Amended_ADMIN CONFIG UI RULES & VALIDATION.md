TRUSTFY v4.3 — ADMIN CONFIG UI RULES & VALIDATION
1. Source of Truth Principle (Non-Negotiable)
•	Smart contract is the only authority
•	Admin UI:
o	reads config from chain
o	validates inputs exactly like the contract
o	submits transactions
•	Backend:
o	mirrors config for display
o	must never compute or override fees/bonds
If UI accepts a value that the contract would reject, the UI is wrong.
2. Config Scope
All values are per token.
Admin manages configuration per ERC20 token:
TokenConfig {
  enabled: boolean

  makerFeeBps: number        // uint16
  takerFeeBps: number        // uint16

  disputeBondBps: number     // uint16

  adBondFixed: bigint        // uint256 (legacy, deprecated)
  adBondBps: number          // uint16 (v4.3 active)

  sellerFundWindow: number   // uint32 (seconds)
  buyerConfirmWindow: number // uint32 (seconds)
  sellerReleaseWindow: number// uint32 (seconds)
}


 
3. Admin UI Sections
Section A — Token Enablement
Fields
•	enabled (toggle)
Rules
•	If disabled:
o	New Ads cannot be created
o	New trades cannot be taken
o	Existing escrows are unaffected
Validation
enabled ∈ {true, false}
Section B — Platform Fees (Percent of Trade Amount)
Inputs
•	Maker Fee (%)
•	Taker Fee (%)
UI Input Format
•	Display as percentage with up to 2 decimals
•	Internally convert to basis points
Example:
1.25% → 125 bps
Validation (must match contract)
0 ≤ makerFeeBps ≤ 10_000
0 ≤ takerFeeBps ≤ 10_000
(makerFeeBps + takerFeeBps) ≤ 10_000
UI Notes (must be shown)
•	“Fees are locked by the crypto seller on-chain.”
•	“Buyer reimburses fees in fiat off-chain.”
•	“Maker/Taker split is for analytics only.”
 
Section C — Dispute Bond (Mandatory, Symmetric)
Input
•	Dispute Bond (% of trade amount)
Validation
0 ≤ disputeBondBps ≤ 10_000
UI Notes
•	“Buyer locks DisputeBond when taking a trade.”
•	“Seller locks DisputeBond when funding escrow.”
•	“Winner refunded, loser forfeits to treasury.”
•	“Applied only to new trades.”
Section D — AdBond (Migration-Safe)
Inputs
•	AdBond (%) [primary, v4.3]
•	Legacy AdBond (fixed amount) [read-only unless explicitly editing legacy tokens]
Active Rule (v4.3)
•	If adBondBps > 0 → percentage mode active
•	If adBondBps == 0 → fallback to adBondFixed (legacy)
Validation
0 ≤ adBondBps ≤ 10_000
adBondFixed ≥ 0
UI Behavior Rules
•	Default: percentage mode
•	If editing an old token:
o	show adBondFixed as read-only
o	show warning banner:
“Legacy fixed AdBond. Recommended: migrate to percentage.”
 
UI Warnings
•	“AdBond applies only to Ad creators (makers).”
•	“AdBond is locked at Ad creation.”
•	“AdBond is forfeited on Ad cancellation or maker failure.”
•	“AdBond is refunded to Credit Wallet on completion.”
Section E — Time Windows (Seconds)
Inputs
•	Seller Funding Window
•	Buyer Payment Confirmation Window
•	Seller Release Window
Validation
sellerFundWindow > 0
buyerConfirmWindow > 0
sellerReleaseWindow > 0
sellerFundWindow ≤ 30 days (recommended UI cap)
buyerConfirmWindow ≤ 24 hours (recommended UI cap)
sellerReleaseWindow ≤ 24 hours (recommended UI cap)
UI may apply soft caps, but contract enforces only uint32.
4. Derived UI Preview (Must Be Read-Only)
For a given example trade amount X, UI must preview:
Trade Amount: X

Maker Fee:  (makerFeeBps / 10_000) * X
Taker Fee:  (takerFeeBps / 10_000) * X
Total Fee:  sum of both

Dispute Bond (each side): (disputeBondBps / 10_000) * X
AdBond: (adBondBps / 10_000) * X
Important
•	These previews are informational only
•	Actual enforcement is on-chain
 
5. Transaction Submission Rules
Before submitting setTokenConfig(...)
UI MUST:
1.	Recompute bps values
2.	Validate all constraints
3.	Show explicit confirmation modal
Confirmation Modal (required text)
“These settings affect only NEW ads and trades.
Existing ads and escrows are NOT modified.”
6. Backend Validation (Mirror, Never Replace)
Backend must:
•	Re-run the same validation logic as UI
•	Reject malformed admin requests before wallet signing
•	Log config version history
Backend must NOT:
•	Auto-correct values
•	Clamp values silently
•	Apply changes off-chain
7. Versioning & Audit Trail
Backend must store:
ConfigVersion {
  token
  makerFeeBps
  takerFeeBps
  disputeBondBps
  adBondBps
  adBondFixed
  sellerFundWindow
  buyerConfirmWindow
  sellerReleaseWindow
  txHash
  blockNumber
  timestamp
  adminAddress
}
 
This allows:
•	forensic audits
•	rollback planning (manual only)
•	governance review
8. Forbidden UI Behaviors (Hard NOs)
•	❌ Allowing admin to edit config without wallet tx
•	❌ Allowing config changes per user
•	❌ Applying config changes to existing escrows
•	❌ Backend “patching” fees/bonds
•	❌ UI accepting values contract would revert
9. Minimal Admin UI Checklist
Before shipping admin panel:
•	Reads live config from chain
•	Validates exactly like contract
•	Explains fee + bond economics clearly
•	Shows migration warnings for legacy AdBond
•	Displays preview amounts
•	Requires explicit confirmation
•	Logs config history
10. Final Sanity Statement
If any admin-set value affects money, it must:
•	be validated in UI
•	be validated again in backend
•	be enforced only in the contract
Your v4.3 design already follows this principle.
This admin UI spec simply prevents human error and drift.

