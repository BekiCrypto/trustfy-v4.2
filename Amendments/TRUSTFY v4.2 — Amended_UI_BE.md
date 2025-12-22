
# ✅ MASTER PROMPT

## Trustfy v4.2 Amended – UI ↔ Backend ↔ Contract Wiring

### ROLE

You are **GPT-5.2-Codex**, acting as a **senior integration engineer** responsible for wiring the **existing Trustfy UI and backend** to the **deployed TrustfyEscrowV4_2_Amended contract**.

Your task is **integration and alignment**, not redesign.

---

## AUTHORITATIVE SOURCES (DO NOT OVERRIDE)

### Contract

* Name: `TrustfyEscrowV4_2_Amended`
* Address:

  ```
  0x954BD1961906C90B65B4AF63539ab1dc6789e25a
  ```
* ABI source of truth:

  ```
  shared/src/contracts/TrustfyEscrowV4_2_Amended_ABI.json
  ```

### Product definition

* Final PRD: `TRUSTFY v4.2 — Amended_PRD.md`
* Admin rules: `TRUSTFY v4.2 — Amended_ADMIN CONFIG UI RULES & VALIDATION.md`
* User guide: `TRUSTFY v4.2 — Amended_User Guide.md`

---

## NON-NEGOTIABLE RULES

1. Do not delete pages, menus, routes, or components.
2. Do not rename existing files unless strictly required.
3. Do not refactor UI structure or visual layout.
4. Do not compute fees, bonds, or rules off-chain.
5. All escrow calls must use the Amended escrow ABI.
6. All token calls must use ERC-20 ABI only.
7. Any missing logic must be added as **guards**, not redesigns.

---

## REQUIRED ARCHITECTURE SEPARATION

### Escrow contract usage

* Address: Trustfy escrow address only
* ABI: TrustfyEscrowV4_2_Amended_ABI.json
* Functions include:

  * tokenConfig
  * createAd
  * takeAd
  * fundEscrow
  * confirmPayment
  * openDispute
  * resolveDispute
  * admin setters

### Token contract usage

* Address: token address only
* ABI: ERC-20
* Functions include:

  * balanceOf
  * allowance
  * approve
  * transferFrom

Never mix these.

---

## STEP 1. DISCOVERY PHASE

Before changing code, you must:

1. Locate every escrow contract call in:

   * UI
   * backend
   * worker / indexer
2. Verify:

   * correct address
   * correct ABI
   * correct chain
3. Identify any usage of:

   * zero address
   * legacy v4.2 ABI
   * ERC-20 ABI used on escrow

Document findings briefly.

---

## STEP 2. ABI AND ADDRESS WIRING

1. Centralize escrow ABI import to:

   ```
   shared/src/contracts/TrustfyEscrowV4_2_Amended_ABI.json
   ```
2. Ensure all escrow calls reference:

   ```
   0x954BD1961906C90B65B4AF63539ab1dc6789e25a
   ```
3. Remove or disable all legacy ABI references.
4. Keep ERC-20 ABI untouched for token helpers.

---

## STEP 3. UI GUARDS BASED ON PRD

Add guards that reflect on-chain truth.

### Token config

* If tokenConfig returns disabled or zeroed struct:

  * Block offer creation
  * Show clear message
* Do not throw
* Do not assume defaults

### Time windows

* Enforce:

  * buyer dispute bond lock window
  * seller escrow funding window
  * buyer payment confirmation window

### Bonds and fees

* Read percentages from contract
* Display computed values
* Never hardcode

---

## STEP 4. ADMIN UI ALIGNMENT

Ensure admin UI can:

* Set MakerFee bps
* Set TakerFee bps
* Set AdBond percentage
* Set DisputeBond percentage
* Enable or disable tokens

Validation must match:

* bps limits
* non-zero constraints
* admin-only access

---

## STEP 5. EVENT AND INDEXER WIRING

Backend or worker must listen to:

* AdCreated
* AdTaken
* EscrowFunded
* PaymentConfirmed
* DisputeOpened
* DisputeResolved
* TreasurySet

Persist:

* escrow state
* ad state
* dispute outcome
* forfeited bonds
* treasury inflow

No off-chain state invention.

---

## STEP 6. ACCESSIBILITY AND STABILITY FIXES

* Every DialogContent must include exactly one DialogTitle.
* If title should not show, wrap with VisuallyHidden.
* No console errors allowed on happy path.

---

## STEP 7. FINAL VALIDATION

You must confirm:

1. tokenConfig(address) decodes correctly
2. Escrow actions succeed end-to-end
3. Admin changes reflect immediately on UI
4. No ABI mismatch remains
5. No zero address usage remains

---

## OUTPUT REQUIREMENTS

Return:

1. Short summary of changes
2. List of files touched
3. Completed checklist below with checkmarks
4. Confirmation of PRD coverage

Do not include unrelated explanations.

---

# ✅ AMENDED UI–BACKEND WIRING CHECKLIST

## Trustfy v4.2 Amended

### Contract and ABI

* [ ] Escrow address matches deployed contract
* [ ] Only TrustfyEscrowV4_2_Amended_ABI used for escrow
* [ ] ERC-20 ABI used only for token contracts
* [ ] No legacy v4.2 ABI references

### Core user flows

* [ ] Buy Ad creation works
* [ ] Sell Ad creation works
* [ ] AdBond locked on ad posting
* [ ] DisputeBond locked at TAKEN
* [ ] Escrow funding locks amount, fees, dispute bond
* [ ] Buyer payment confirmation works
* [ ] Seller release works
* [ ] Happy path refunds bonds correctly

### Disputes

* [ ] Only one dispute per escrow
* [ ] Buyer dispute allowed only after payment confirmation
* [ ] Seller dispute allowed only after escrow funding
* [ ] Losing party bond goes to treasury
* [ ] Winning party protected

### Fees and treasury

* [ ] MakerFee read from contract
* [ ] TakerFee read from contract
* [ ] Fees accounted to treasury
* [ ] Analytics split only off-chain

### Admin

* [ ] Token enable or disable works
* [ ] Fee bps editable
* [ ] Bond percentages editable
* [ ] Validation enforced

### Backend and indexer

* [ ] All escrow events indexed
* [ ] State transitions consistent with chain
* [ ] No derived state contradictions

### UI stability

* [ ] No Dialog accessibility warnings
* [ ] No decode errors
* [ ] No zero address usage
* [ ] No console errors on happy path

---

## Final instruction to Codex

> Integrate, align, and guard.
> Do not redesign.
> Do not assume.
> Let the contract remain the single source of truth.
