# Trustfy V4.2 – Product & Protocol Specification

**Status:** Final  
**Audience:** Smart-contract engineers, backend engineers, auditors, indexer developers  
**Scope:** On-chain enforcement + off-chain coordination  
**Chains:** EVM compatible  

---

## 1. Purpose of This Document

This document defines **Trustfy V4.2** as an enforceable protocol, not a concept.

It exists to:
- Remove ambiguity from earlier PRDs
- Align smart contracts with economic promises
- Make audits deterministic
- Allow developers to implement without guessing intent

If something is not explicitly defined here, it is **out of scope**.

---

## 2. Core Philosophy (Non-Negotiable)

1. Trust is replaced by **locked capital**
2. Funds are locked **before** trade execution
3. No central custody of user funds
4. Disputes resolve by **facts + bonds**, not discretion
5. Platform fees pay for service, not punishment
6. Every terminal state produces deterministic balances

---

## 3. System Architecture

### 3.1 On-chain Contracts

| Contract | Responsibility |
|-------|---------------|
| `TrustfyCreditVault` | Unified credit wallet per user per token |
| `TrustfyAdBondManager` | Ad bond locking, slashing, ad state enforcement |
| `TrustfyEscrow` | Trade lifecycle, fees, bonds, disputes |

Each contract has **one responsibility**.  
No contract may leak responsibilities into another.

---

### 3.2 Off-chain Components (Non-Custodial)

- UI (intent builder, approvals)
- Indexer (event → DB mirror)
- Fiat coordination (messaging only)
- Evidence storage (off-chain)

Off-chain components **never move funds**.

---

## 4. Asset Model

### 4.1 TokenKey

All balances are keyed by `tokenKey`:

- `address(0)` → native coin
- `ERC20 address` → ERC20 token

All ledgers, pools, and credits are tracked per tokenKey.

---

## 5. Unified Credit Wallet (V4.2 Core)

### 5.1 Definition

Each user has a **single unified credit wallet per token**:


Credits are user-owned but **system-managed**.

---

### 5.2 How Credits Increase

Credits can increase only by:

1. Wallet deposits (native or ERC20)
2. Contract-granted credits from:
   - bond refunds
   - fee refunds
   - trade refunds
   - seller-wins dispute refunds

No other mechanism may increase credits.

---

### 5.3 How Credits Are Spent

Credits are spent only by **system contracts**:
- Escrow
- AdBondManager

Users cannot arbitrarily spend credits.

---

### 5.4 Withdrawals

Rules:
- User must have sufficient credit
- `credits >= withdrawThreshold`
- Withdrawal sends funds to user wallet
- Threshold exists to reduce micro-withdraw spam

Credits remain user property at all times.

---

## 6. Fee Model (V4.2 Clarified)

### 6.1 Fee Types

- Maker fee
- Taker fee

Properties:
- Fees exist only in crypto
- Fees are locked upfront by seller
- Buyer reimburses fee off-chain in fiat

---

### 6.2 Fee Settlement Rules (Critical)

| Trade Outcome | Fee Treatment |
|-------------|---------------|
| Happy path | Fee collected to platform |
| Dispute – buyer wins | Fee collected to platform |
| Dispute – seller wins | Fee refunded to seller credits |

Fees are **service payment**, not penalties.

---

## 7. Bond System

### 7.1 Bond Types

| Bond | Purpose |
|----|--------|
| Ad Bond | Spam prevention |
| Seller Bond | Seller honesty |
| Buyer Bond | Buyer honesty |

---

### 7.2 Bond Rules

- Bonds must be locked before progress
- Winner bond is refunded
- Loser bond is forfeited to platform bond pool
- Bond refunds always go to credits

---

## 8. Ad Lifecycle & Enforcement (V4.2 Core)

### 8.1 Ad Bond Requirement

Before an ad is visible:
- Ad bond must be locked
- Funding source: credit wallet or Web3 wallet

No bond → no ad.

---

### 8.2 Ad States

| State | Meaning |
|----|-------|
| POSTED | Editable, cancelable |
| IN_PROGRESS | Trade active, locked |
| CLOSED | Closed, bond refunded |
| CANCELLED_SLASHED | Bond forfeited |

---

### 8.3 Editing Rules

- Editing allowed only in POSTED
- Editing blocked in IN_PROGRESS

---

### 8.4 Cancellation Rules

- Cancel in POSTED → bond forfeited
- Cancel in IN_PROGRESS → blocked

Ad spam is discouraged economically.

---

## 9. Trade Lifecycle

### 9.1 On-Chain Trade States

| State | Description |
|----|-------------|
| CREATED | Seller listed trade |
| TAKEN | Buyer accepted |
| FUNDED | Seller locked funds |
| PAYMENT_CONFIRMED | Buyer locked bond |
| DISPUTED | Arbitration |
| RESOLVED | Finalized |
| CANCELLED | Timeout refund |

---

### 9.2 Trade Flow

1. Seller creates trade
2. Buyer takes trade
3. Seller locks amount + fee + seller bond
4. Buyer confirms payment and locks buyer bond
5. Seller releases funds OR dispute begins

---

## 10. Timeout Rules

| Scenario | Result |
|-------|--------|
| Buyer fails to confirm | Seller refunds after window |
| Seller fails to release | Buyer opens dispute |

Timeouts prevent hostage scenarios.

---

## 11. Dispute System (Final Logic)

### 11.1 Dispute Initiation

- Allowed after release window
- Either party may initiate

---

### 11.2 Dispute Outcomes (Do Not Modify)

#### Buyer Wins
- Buyer receives trade amount
- Buyer bond refunded to credits
- Seller bond forfeited to platform
- Platform fee collected

#### Seller Wins
- Seller receives trade amount back
- Seller bond refunded to credits
- Buyer bond forfeited to platform
- Platform fee refunded to seller credits

This rule is intentional and final.

---

## 12. Platform Revenue Accounting

### 12.1 Pools

| Pool | Source |
|----|--------|
| platformFeePool | Collected fees |
| platformBondRevenue | Forfeited trade bonds |
| adBondRevenue | Slashed ad bonds |

Pools are separated per tokenKey.

---

### 12.2 Withdrawals

- Admin withdraws to `feeRecipient`
- Admin cannot touch user credits
- Withdrawals are explicit and auditable

---

## 13. Security Constraints

Mandatory:
- Reentrancy guards
- No `transfer()` usage
- Low-level call with checks
- Strict tokenKey validation
- Fee bps upper bound
- Role-based access control

---

## 14. Off-Chain Responsibilities

| Component | Responsibility |
|--------|----------------|
| UI | Build intent, approvals |
| Indexer | Mirror on-chain state |
| Messaging | Fiat coordination |
| Evidence | Dispute proof |

Off-chain logic never enforces outcomes.

---

## 15. Compliance Position

- No custody of user funds
- No forced KYC on-chain
- Transparent dispute logic
- Deterministic settlement

---

## 16. Audit Expectations

Auditors should verify:
- Deterministic balance deltas
- No hidden admin powers
- Bond symmetry
- Fee logic correctness
- No stuck-fund scenarios

---

## 17. Non-Goals

Trustfy does NOT:
- Guarantee fiat payment
- Act as counterparty
- Reverse final on-chain outcomes
- Enforce off-chain evidence formats

---

## 18. Acceptance Criteria (Engineering)

Implementation is complete only if:

- Every PRD rule maps to on-chain logic
- All terminal states have predictable balances
- Ad spam is economically discouraged
- Seller-wins disputes refund fees
- Buyer-wins disputes charge fees
- Unified credit wallet is used everywhere

---

## 19. Final Note

Trustfy V4.2 is an **economic protocol**, not a UI feature.

If enforcement is weak, trust collapses.  
If enforcement is clear, trust is unnecessary.

Build accordingly.
