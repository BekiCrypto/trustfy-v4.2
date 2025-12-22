
# TRUSTFY UI–PRD COVERAGE CHECKLIST

### (v4.2 Amended — Core Flows Only)

> **Goal:**
> Confirm the UI can **fully execute, guard, and explain** every **core PRD flow**, without deleting or refactoring existing modules.

Status note: Items are marked based on current UI implementation. Final acceptance test (Section 12) requires a manual run to validate.

---

## 0. GLOBAL UI BASELINE (MANDATORY)

* [x] UI reads **escrow state from chain / backend indexer**
* [x] UI never assumes state transitions
* [x] UI disables actions that would revert on-chain
* [x] UI shows **clear reason** when action is disabled
* [x] UI terminology matches PRD exactly (no aliases)

---

## 1. AD CREATION (MAKER FLOW)

### Sell Ad Creation

* [x] Maker can create Sell Ad
* [x] UI requires AdBond lock before submit
* [x] UI shows:

  * Trade token
  * Amount
  * AdBond amount (preview)
* [x] UI warns:

  * “AdBond forfeited if Ad is cancelled”
* [x] UI blocks creation if token disabled by admin
* [x] UI submits without computing authority logic

### Buy Ad Creation

* [x] Maker can create Buy Ad
* [x] AdBond required (same rule as Sell Ad)
* [x] UI distinguishes Buy vs Sell Ad clearly
* [x] Ad shows correct role expectations

---

## 2. AD STATE VISIBILITY

* [x] Ad list shows state badge:

  * CREATED
  * TAKEN
  * CANCELLED
  * COMPLETED
* [x] TAKEN Ads are not clickable for new takers
* [x] CANCELLED Ads clearly indicate penalty outcome
* [x] COMPLETED Ads are read-only

---

## 3. TAKING AN AD (TAKER FLOW)

* [x] Only one taker allowed per Ad
* [x] Buyer must lock **DisputeBond** to TAKE
* [x] UI previews DisputeBond amount
* [x] UI warns:

  * “Failure to proceed may forfeit DisputeBond”
* [x] Ad immediately becomes TAKEN after bond lock
* [x] Competing buyers are blocked instantly

---

## 4. SELLER ESCROW FUNDING

* [x] Seller can fund escrow only after TAKEN
* [x] Single action locks:

  * Trade amount
  * Platform fees
  * Seller DisputeBond
* [x] UI preview explains each component
* [x] Buyer cannot confirm payment before FUNDED
* [x] Funding countdown timer visible
* [x] Failure to fund triggers:

  * AdBond forfeiture
  * Buyer DisputeBond refund

---

## 5. BUYER PAYMENT CONFIRMATION

* [x] Buyer can confirm payment only after FUNDED
* [x] Confirmation requires explicit user action
* [x] Evidence upload option available
* [x] Countdown timer visible
* [x] UI warns:

  * “Missing deadline forfeits DisputeBond”
* [x] Failure to confirm forfeits Buyer DisputeBond

---

## 6. SELLER ESCROW RELEASE

* [x] Seller can release only after PAYMENT_CONFIRMED
* [x] UI shows irreversible warning
* [x] On release:

  * Buyer receives crypto
  * Fees go to treasury
  * Bonds refunded
* [x] Ad moves to COMPLETED
* [x] Escrow becomes read-only

---

## 7. DISPUTE FLOW (STRICT)

### Eligibility

* [x] Dispute allowed **only after PAYMENT_CONFIRMED**
* [x] Exactly **one dispute per escrow**
* [x] Either buyer or seller may open
* [x] Second dispute attempt blocked

### Filing

* [x] UI shows DisputeBond consequences
* [x] UI requires explicit confirmation
* [x] UI locks escrow immediately after dispute

### Resolution

* [x] Arbitrator sees:

  * Timeline
  * Evidence
  * Single resolve action
* [x] UI reflects:

  * Winner refunded
  * Loser DisputeBond sent to treasury
* [x] Escrow marked RESOLVED

---

## 8. TIME WINDOW ENFORCEMENT

* [x] Seller funding timer visible
* [x] Buyer confirmation timer visible
* [x] Seller release timer visible (if defined)
* [x] UI disables actions after expiry
* [x] UI explains penalty outcome on expiry

---

## 9. ADMIN CONFIGURATION UI

* [x] Admin can configure per token:

  * MakerFee (%)
  * TakerFee (%)
  * AdBond (%)
  * DisputeBond (%)
* [x] Zod schema enforces Solidity limits
* [x] UI previews numeric outcomes
* [x] UI warns:

  * “Applies only to new Ads / Trades”
* [x] No off-chain enforcement of config

---

## 10. WALLET & ROLE GUARDS

* [x] Wallet connection required before actions
* [x] Wrong network blocked
* [x] Role-restricted actions guarded:

  * Admin
  * Arbitrator
* [x] UI validates contract deployment

---

## 11. EXTENDED / FUTURE MODULES

* [x] Existing menus remain visible
* [x] Incomplete modules are not deleted
* [x] UI labels them as “Coming Soon” if needed
* [x] No regression to existing navigation

---

## 12. FINAL ACCEPTANCE TEST (HARD STOP)

A fresh user can:

* [ ] Create Ad
* [ ] Take Ad
* [ ] Complete happy-path trade
* [ ] Open valid dispute
* [ ] Lose dispute and see penalty

An admin can:

* [ ] Configure fees/bonds safely
* [ ] See changes reflected in UI previews

No action contradicts PRD or contract.

---

## STATUS DEFINITION

* ✅ Checked = PRD compliant
* ❌ Unchecked = UI gap
* 🚫 Blocker = must fix before launch

---

### END OF UI–PRD COVERAGE CHECKLIST
