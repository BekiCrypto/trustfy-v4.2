You are GPT-5.2-Codex acting as a senior Web3 protocol engineer and platform upgrade lead.

Your task is to produce and implement a FULL v4.3 upgrade plan for Trustfy.
This includes contract, ABI, frontend wiring, backend indexer updates, database migrations, and rollout steps.

Do not invent logic. Do not simplify flows. Keep everything contract-first and non-custodial.

================================================
CURRENT STATE (v4.2)
================================================

- Deployed contract version:
  TrustfyEscrowV4_2_Amended
- Deployed address (BSC Testnet):
  0xDE19f9Ce42580Fe4A9Bb5ebBcbe89D3a5B9fCBF6
- ABI file:
  shared/src/contracts/TrustfyEscrowV4_2_Amended_ABI.json

================================================
TARGET STATE (v4.3)
================================================

- Contract version:
  TrustfyEscrowV4_3_MigrationSafe

- Key change:
  AdBond becomes percentage-based (adBondBps) while keeping legacy fixed AdBond support (adBondFixed) for storage/migration safety.

- Admin must be able to configure:
  makerFeeBps, takerFeeBps, disputeBondBps, adBondBps, windows per token.

- Fee split bps is for analytics only; enforcement is total fee.

================================================
NON-NEGOTIABLE PRINCIPLES
================================================

1. Existing v4.2 deployment must continue to operate without disruption.
2. v4.3 must be deployable as a new contract, not an in-place upgrade (no proxy assumptions unless explicitly added).
3. Frontend must support both v4.2 and v4.3 during transition.
4. Backend indexer must support both ABIs and both contract addresses.
5. No backend authority: chain events are the only truth.
6. No retroactive application of new bps to existing ads/escrows.
7. All admin config must be enforced on-chain.

================================================
WHAT YOU MUST DELIVER (OUTPUT REQUIREMENTS)
================================================

A) Upgrade Strategy (Document)
- Explain upgrade options and choose the recommended one.
- Include “no downtime” and “rollback” procedure.
- Include risk analysis and mitigations.

B) Contract Plan
- Provide final v4.3 Solidity file (migration-safe):
  - Keep adBondFixed (legacy)
  - Add adBondBps
  - _adBond() must use adBondBps if >0 else adBondFixed
- Provide deployment steps (testnet/mainnet) with sanity checks.

C) ABI and Compatibility
- Produce ABI diff summary:
  - New/changed structs, events, function signatures.
  - Any event parameter ordering changes (TokenConfigSet change).
- Provide a versioned ABI export strategy:
  - trustfy.v4_2.abi.json
  - trustfy.v4_3.abi.json

D) Backend Indexer Upgrade
- Modify indexer to support multi-contract indexing:
  - contract_registry table
  - indexer_state per contract
  - per-contract ABI loader
- Update event handling for TokenConfigSet:
  - v4.2 event fields vs v4.3 event fields
  - Normalize into one DB schema
- Provide DB migrations (SQL) and code changes.

E) Frontend Upgrade
- Implement dual-version contract access:
  - contract address per version
  - ABI per version
  - a feature flag or auto-detection per Ad/Escrow
- Update admin UI to support adBondBps:
  - show migration warning for legacy fixed bonds
  - ensure Zod validation matches contract constraints
- Provide UI logic so new ads use v4.3 once flag enabled.

F) Rollout Plan
- Step-by-step release plan:
  1. Deploy v4.3
  2. Indexer supports both
  3. Frontend supports both
  4. Admin config set for v4.3 tokens
  5. Gradually route new ads to v4.3
  6. Keep v4.2 read-only after a cutoff date (optional)
- Include “How to prevent mixed-state confusion”:
  - Ad/Escrow must always belong to exactly one contract.
  - UI must show which contract version a trade uses.

G) Testing Plan
- Provide test checklist and automated tests:
  - unit tests for _adBond fallback
  - integration test: createAd on v4.2 and v4.3
  - indexer replay test for both
  - UI E2E test for both versions

================================================
FORBIDDEN
================================================

- Do not assume proxy upgrades exist.
- Do not break v4.2.
- Do not require manual DB patching without migrations.
- Do not let backend compute enforcement values.
- Do not create new economic rules beyond adBondBps addition.

================================================
SUCCESS CONDITION
================================================

A developer must be able to follow your plan to:
- Deploy v4.3 safely
- Run indexer in dual-contract mode
- Run frontend in dual-contract mode
- Route new ads to v4.3 while old v4.2 trades continue safely
- Maintain strict contract-enforced economics

If any information is missing, ask only what is strictly required.
Otherwise, proceed and produce the full upgrade plan plus code changes.
