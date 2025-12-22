# TRUSTFY v4.3 — FINAL PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1. Purpose & Scope

Trustfy is a **non-custodial P2P crypto escrow marketplace** that enables fiat-to-crypto trades without trusting a central operator.

The system enforces:

* economic discipline against spam ads
* economic discipline against fake reservations
* economic discipline against dishonest disputes
* deterministic outcomes enforced on-chain

All sensitive value movements occur **only in smart contracts**.
Backend and UI act strictly as coordination layers.

---

## 2. Core Principles (Non-Negotiable)

1. **Non-custodial**

   * No admin, backend, or arbitrator can move funds off-chain.
2. **On-chain enforcement**

   * Fees, bonds, penalties, refunds are computed and enforced in the contract.
3. **Economic accountability**

   * Every meaningful action has a cost or locked stake.
4. **One truth**

   * Smart-contract events are the only source of state.
5. **Forward-only configuration**

   * Admin changes affect only new ads and trades.

---

## 3. Actors & Roles

### 3.1 Users

* **Maker**: Posts an Ad (buy or sell).
* **Taker**: Fulfills an existing Ad.

### 3.2 Arbitrator

* Resolves disputes on-chain.
* Cannot move funds arbitrarily.

### 3.3 Admin

* Configures fees, bonds, and time windows.
* No override or custody powers.

---

## 4. Core Objects

### 4.1 Ad (Market Listing)

An Ad represents **intent**, not a trade.

**Ad Types**

* Sell Ad: Maker sells crypto.
* Buy Ad: Maker buys crypto.

**Ad Properties**

* `adId`
* `maker`
* `isSellAd`
* `token`
* `amount`
* `adBond`
* `state`
* `activeEscrowId`

**Ad States**

* `CREATED`
* `TAKEN`
* `CANCELLED`
* `COMPLETED`

---

### 4.2 Escrow (Trade Instance)

Created only after an Ad is taken.

**Escrow Properties**

* `escrowId`
* `adId`
* `buyer`
* `seller`
* `token`
* `amount`
* `feeAmount`
* `buyerDisputeBond`
* `sellerDisputeBond`
* `status`
* timestamps

**Escrow States**

* `CREATED`
* `TAKEN`
* `FUNDED`
* `PAYMENT_CONFIRMED`
* `DISPUTED`
* `RESOLVED`
* `CANCELLED`

---

## 5. Fees & Bonds (Final Rules)

### 5.1 Platform Fees

* Two components:

  * Maker Fee (%)
  * Taker Fee (%)
* Stored separately for analytics.
* Enforced as **one total fee** on-chain.

**Rules**

* FeeAmount = (MakerFeeBps + TakerFeeBps) × TradeAmount
* Locked by **crypto seller** at escrow funding.
* Buyer reimburses seller in fiat off-chain.
* FeeAmount goes to Treasury.

---

### 5.2 AdBond (Spam Ad Prevention)

* Required **only** from Ad poster (maker).
* Percentage of Ad amount.
* Same token as trade token.

**Lifecycle**

* Locked at Ad creation.
* Returned to maker Credit Wallet on successful trade.
* Forfeited to Treasury if:

  * maker cancels the Ad
  * maker fails a maker-only obligation

Takers never pay AdBond.

---

### 5.3 DisputeBond (Symmetric, Mandatory)

* Required from **both buyer and seller**.
* Percentage of trade amount.
* Same token as trade token.

**Lock Timing**

* Buyer locks at `TAKEN`.
* Seller locks at `FUNDED`.

**Happy Path**

* Both DisputeBonds returned to Credit Wallets.

**Dispute Outcome**

* Winner refunded.
* Loser forfeited **100% to Treasury**.

**Timeout Penalty**

* Buyer fails to confirm payment → buyer DisputeBond forfeited to Treasury.

---

## 6. Time Windows (Admin-Configurable)

All windows measured from **on-chain timestamps**.

| Window                | Starts            | Missed Outcome                                                    |
| --------------------- | ----------------- | ----------------------------------------------------------------- |
| Seller Funding        | TAKEN             | Buyer DisputeBond refunded; AdBond forfeited only if maker failed |
| Buyer Payment Confirm | FUNDED            | Buyer DisputeBond forfeited to Treasury                           |
| Seller Release        | PAYMENT_CONFIRMED | Buyer may dispute                                                 |

---

## 7. Trade Lifecycle (Authoritative)

### Step 1 — Create Ad

* Maker locks AdBond.
* Ad state → `CREATED`.

---

### Step 2 — Take Ad

* Taker locks Buyer DisputeBond.
* Ad → `TAKEN`.
* Escrow → `TAKEN`.
* Seller notified.

Only first successful take is valid.

---

### Step 3 — Fund Escrow

Seller locks in one transaction:

* Trade amount
* FeeAmount
* Seller DisputeBond

Escrow → `FUNDED`.
Buyer confirmation window starts.

---

### Step 4 — Confirm Payment

* Buyer pays fiat off-chain.
* Buyer clicks “Payment Made”.
* Evidence may be uploaded.

Escrow → `PAYMENT_CONFIRMED`.

If buyer misses window:

* Buyer DisputeBond forfeited to Treasury.
* Seller funds refunded to seller wallet.
* Ad reopens.

---

### Step 5 — Release Escrow

* Seller confirms fiat receipt.
* Crypto released to buyer.

**Settlement**

* Buyer receives crypto.
* Treasury receives fees.
* AdBond refunded to maker Credit Wallet.
* DisputeBonds refunded to both parties.

Escrow → `RESOLVED`.
Ad → `COMPLETED`.

---

## 8. Dispute Flow

### 8.1 Eligibility

* Only after `PAYMENT_CONFIRMED`.
* Either buyer or seller.
* Exactly one dispute per escrow.

### 8.2 Buyer Dispute

* Buyer confirmed payment.
* Seller did not release.

### 8.3 Seller Dispute

* Seller funded escrow.
* Buyer confirmed payment.
* Seller claims fiat not received.

---

### 8.4 Resolution

* Arbitrator resolves on-chain.
* Outcome:

  * Buyer wins → buyer gets crypto.
  * Seller wins → seller gets crypto.
* Winner DisputeBond refunded.
* Loser DisputeBond forfeited to Treasury.
* AdBond refunded to maker.

Escrow → `RESOLVED`.

---

## 9. Admin Configuration

Admin can configure **per token**:

* MakerFeeBps
* TakerFeeBps
* DisputeBondBps
* AdBondBps
* SellerFundingWindow
* BuyerConfirmWindow
* SellerReleaseWindow
* Token enabled/disabled

**Constraints**

* All values are percentages or seconds.
* Changes apply only to new Ads and trades.
* Existing escrows remain unaffected.

---

## 10. Backend Responsibilities

Backend:

* Indexes contract events.
* Stores off-chain data:

  * payment instructions
  * evidence metadata
  * chat
  * notifications
* Enforces read access only.
* No custody.
* No state mutation.

---

## 11. UI Responsibilities

UI:

* Reflects contract state only.
* Guards user actions by escrow/ad state.
* Calculates previews but never enforces values.
* Blocks invalid actions before wallet signing.

---

## 12. Non-Goals

* Fiat custody
* KYC enforcement
* Admin override of disputes
* Retroactive config changes
* Backend-driven settlement

---

## 13. Final Guarantees

Trustfy v4.3 guarantees:

* No trust in operators
* No silent penalties
* No ambiguous outcomes
* No off-chain enforcement
* Clear economic consequences for misuse

---

**This PRD is final and implementation-ready.**
Any future changes require a new version (v4.4+) and explicit migration notes.