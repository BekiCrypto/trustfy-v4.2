
# TRUSTFY UI–PRD COVERAGE CHECKLIST

### (v4.2 Amended — Core Flows Only)

> **Goal:**
> Confirm the UI can **fully execute, guard, and explain** every **core PRD flow**, without deleting or refactoring existing modules.

---

## 0. GLOBAL UI BASELINE (MANDATORY)

* [ ] UI reads **escrow state from chain / backend indexer**
* [ ] UI never assumes state transitions
* [ ] UI disables actions that would revert on-chain
* [ ] UI shows **clear reason** when action is disabled
* [ ] UI terminology matches PRD exactly (no aliases)

---

## 1. AD CREATION (MAKER FLOW)

### Sell Ad Creation

* [ ] Maker can create Sell Ad
* [ ] UI requires AdBond lock before submit
* [ ] UI shows:

  * Trade token
  * Amount
  * AdBond amount (preview)
* [ ] UI warns:

  * “AdBond forfeited if Ad is cancelled”
* [ ] UI blocks creation if token disabled by admin
* [ ] UI submits without computing authority logic

### Buy Ad Creation

* [ ] Maker can create Buy Ad
* [ ] AdBond required (same rule as Sell Ad)
* [ ] UI distinguishes Buy vs Sell Ad clearly
* [ ] Ad shows correct role expectations

---

## 2. AD STATE VISIBILITY

* [ ] Ad list shows state badge:

  * CREATED
  * TAKEN
  * CANCELLED
  * COMPLETED
* [ ] TAKEN Ads are not clickable for new takers
* [ ] CANCELLED Ads clearly indicate penalty outcome
* [ ] COMPLETED Ads are read-only

---

## 3. TAKING AN AD (TAKER FLOW)

* [ ] Only one taker allowed per Ad
* [ ] Buyer must lock **DisputeBond** to TAKE
* [ ] UI previews DisputeBond amount
* [ ] UI warns:

  * “Failure to proceed may forfeit DisputeBond”
* [ ] Ad immediately becomes TAKEN after bond lock
* [ ] Competing buyers are blocked instantly

---

## 4. SELLER ESCROW FUNDING

* [ ] Seller can fund escrow only after TAKEN
* [ ] Single action locks:

  * Trade amount
  * Platform fees
  * Seller DisputeBond
* [ ] UI preview explains each component
* [ ] Buyer cannot confirm payment before FUNDED
* [ ] Funding countdown timer visible
* [ ] Failure to fund triggers:

  * AdBond forfeiture
  * Buyer DisputeBond refund

---

## 5. BUYER PAYMENT CONFIRMATION

* [ ] Buyer can confirm payment only after FUNDED
* [ ] Confirmation requires explicit user action
* [ ] Evidence upload option available
* [ ] Countdown timer visible
* [ ] UI warns:

  * “Missing deadline forfeits DisputeBond”
* [ ] Failure to confirm forfeits Buyer DisputeBond

---

## 6. SELLER ESCROW RELEASE

* [ ] Seller can release only after PAYMENT_CONFIRMED
* [ ] UI shows irreversible warning
* [ ] On release:

  * Buyer receives crypto
  * Fees go to treasury
  * Bonds refunded
* [ ] Ad moves to COMPLETED
* [ ] Escrow becomes read-only

---

## 7. DISPUTE FLOW (STRICT)

### Eligibility

* [ ] Dispute allowed **only after PAYMENT_CONFIRMED**
* [ ] Exactly **one dispute per escrow**
* [ ] Either buyer or seller may open
* [ ] Second dispute attempt blocked

### Filing

* [ ] UI shows DisputeBond consequences
* [ ] UI requires explicit confirmation
* [ ] UI locks escrow immediately after dispute

### Resolution

* [ ] Arbitrator sees:

  * Timeline
  * Evidence
  * Single resolve action
* [ ] UI reflects:

  * Winner refunded
  * Loser DisputeBond sent to treasury
* [ ] Escrow marked RESOLVED

---

## 8. TIME WINDOW ENFORCEMENT

* [ ] Seller funding timer visible
* [ ] Buyer confirmation timer visible
* [ ] Seller release timer visible (if defined)
* [ ] UI disables actions after expiry
* [ ] UI explains penalty outcome on expiry

---

## 9. ADMIN CONFIGURATION UI

* [ ] Admin can configure per token:

  * MakerFee (%)
  * TakerFee (%)
  * AdBond (%)
  * DisputeBond (%)
* [ ] Zod schema enforces Solidity limits
* [ ] UI previews numeric outcomes
* [ ] UI warns:

  * “Applies only to new Ads / Trades”
* [ ] No off-chain enforcement of config

---

## 10. WALLET & ROLE GUARDS

* [ ] Wallet connection required before actions
* [ ] Wrong network blocked
* [ ] Role-restricted actions guarded:

  * Admin
  * Arbitrator
* [ ] UI validates contract deployment

---

## 11. EXTENDED / FUTURE MODULES

* [ ] Existing menus remain visible
* [ ] Incomplete modules are not deleted
* [ ] UI labels them as “Coming Soon” if needed
* [ ] No regression to existing navigation

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
