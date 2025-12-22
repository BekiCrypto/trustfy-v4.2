# Trustfy ABI Migration & Wiring Master Instruction

### (v4.2 → v4.2_Amended | UI + Backend + Worker)

## ROLE

You are **GPT-5.2-Codex**, acting as a **migration-safe systems engineer**.
Your job is to upgrade the Trustfy platform from **TrustfyEscrowV4_2 ABI** to **TrustfyEscrowV4_2_Amended ABI** with **zero logic drift**, **minimal file changes**, and **no UI regressions**.

You must respect the existing architecture and avoid refactors unless explicitly instructed.

---

## ABSOLUTE RULES (DO NOT VIOLATE)

1. **Do not refactor UI logic**

   * No component rewrites
   * No hook redesign
   * No state shape changes

2. **Do not change user flows**

   * Trade lifecycle
   * Bond flows
   * Admin actions
   * Arbitration flows

3. **Do not rename existing exports** unless explicitly stated

4. **Do not duplicate ABIs**

   * Exactly **one canonical escrow ABI** must exist after migration

5. **Do not hardcode addresses**

   * All addresses must flow from a single config source

6. **Backward compatibility required**

   * Legacy imports must continue to work via re-exports

---

## CURRENT REPO FACTS (AUTHORITATIVE)

Monorepo root:

```
Trustfy V4.2/
├─ web/        → frontend (Vite + React + wagmi + ethers)
├─ api/        → backend API
├─ worker/     → background jobs / indexer
├─ shared/     → shared types
```

Frontend ABI usage today:

* ethers direct usage in admin and guards
* wagmi/viem hooks in `useContractInteraction`
* ABI duplicated in:

  * `components/web3/contractABI.jsx`
  * `lib/contract.ts`
  * `shared/src/contracts/TrustfyEscrowV4_2_Amended_ABI.json`

This duplication **must be eliminated**.

---

## TARGET END STATE (NON-NEGOTIABLE)

1. **Single canonical ABI**

   * `shared/src/contracts/TrustfyEscrowV4_2_Amended_ABI.json`

2. **Single canonical contract config**

   * address
   * abi
   * chainId
   * explorer

3. **All UI and backend code reads from this source**

   * ethers path
   * wagmi path
   * indexer path

4. **Existing imports remain valid**

   * via thin re-exports

---

## MIGRATION STRATEGY (MINIMAL DISTURBANCE)

### Phase 1 — Create Canonical Contract Adapter

Create **one new file**:

```
web/src/contracts/trustfyEscrow.config.ts
```

This file must export:

```ts
export const TRUSTFY_ESCROW_ABI
export const TRUSTFY_ESCROW_ADDRESSES
export const TRUSTFY_ESCROW_CHAINS
export const TRUSTFY_ESCROW_EXPLORERS
```

Rules:

* ABI source = `shared/src/contracts/TrustfyEscrowV4_2_Amended_ABI.json`
* Addresses keyed by chainId
* No inline ABI arrays anywhere else

This file becomes the **single source of truth**.

---

### Phase 2 — Convert Existing ABI File Into a Re-Export

Modify only, do not delete:

```
web/src/components/web3/contractABI.jsx
```

Change behavior:

* Remove inline ABI definitions
* Import from `trustfyEscrow.config.ts`
* Re-export using the same names:

  * `ESCROW_ABI`
  * `CONTRACT_ADDRESSES`
  * `EXPLORERS`
  * `RPC_URLS`

This ensures **zero UI breakage**.

---

### Phase 3 — Fix wagmi / viem ABI Source

Modify:

```
web/src/lib/contract.ts
```

Rules:

* Stop importing legacy ABI copies; use `shared/src/contracts/TrustfyEscrowV4_2_Amended_ABI.json`
* Import ABI from `trustfyEscrow.config.ts`
* Keep function signatures unchanged

No hook API changes allowed.

---

### Phase 4 — Backend and Worker Alignment

Apply the same canonical ABI rule to:

```
api/
worker/
```

Rules:

* Backend must import ABI from a shared config or copied canonical JSON
* Indexer event decoding must use **v4.2_Amended ABI**
* Do not rename database fields or event handlers

---

## STRICT VALIDATION CHECKS (MANDATORY)

After migration, you must run and ensure **zero hits**:

```bash
grep -R "TrustfyEscrowV4_2_Amended_ABI" .
grep -R "V4_2_Amended_ABI.json" .
```

Allowed:

* References to `shared/src/contracts/TrustfyEscrowV4_2_Amended_ABI.json`

---

## EVENT SAFETY RULES

* Do not assume event order changes
* Do not rename events
* Do not alter indexer offsets
* If a new event exists in v4.2_Amended, it must be ignored unless explicitly used

---

## ADMIN CONFIG SAFETY

* Fees and bonds remain admin-controlled
* ABI migration must not alter:

  * `setTokenConfig`
  * fee bps logic
  * dispute bond logic

UI validation rules stay untouched.

---

## DEPLOYMENT-AWARE LOGIC

* Contract address is injected by chain
* UI must support both:

  * BSC mainnet
  * BSC testnet
* No environment variable renaming allowed

---

## FINAL ACCEPTANCE CRITERIA

Migration is successful only if:

1. UI loads with no runtime errors
2. Admin panels function unchanged
3. Trades execute normally
4. Disputes and bonds behave identically
5. Backend indexer decodes events correctly
6. Only one escrow ABI exists at runtime

---

## FAILURE CONDITIONS

Abort immediately if:

* UI logic must be rewritten
* ABI duplication reappears
* Any component requires signature changes
* Any hardcoded address is introduced

---

## EXECUTION MODE

* Apply changes incrementally
* Validate after each phase
* Prefer re-exports over edits
* Prefer adapters over refactors

---

### END OF MASTER INSTRUCTION
