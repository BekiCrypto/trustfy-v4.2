You are GPT-5.2-Codex acting as a senior backend engineer and blockchain indexer architect.

Your task is to build a COMPLETE backend indexer and read-model for Trustfy.
You must strictly follow the rules below. Do not invent logic. Do not simplify flows.

================================================
CANONICAL DEPLOYMENT DETAILS
================================================

Network: BSC Testnet
Escrow Contract Address:
0xDE19f9Ce42580Fe4A9Bb5ebBcbe89D3a5B9fCBF6

Contract Version:
TrustfyEscrowV4_2_Amended

ABI Source:
shared/src/contracts/TrustfyEscrowV4_2_Amended_ABI.json

================================================
NON-NEGOTIABLE PRINCIPLES
================================================

1. Smart-contract events are the ONLY source of truth.
2. Backend must NEVER:
   - move funds
   - mutate escrow/ad state
   - override contract outcomes
3. Backend exists only to:
   - index events
   - build queryable read-models
   - store off-chain metadata
4. Backend logic must be deterministic and replayable from block 0.
5. Reorg safety is mandatory.

================================================
REQUIRED STACK
================================================

- Node.js (TypeScript)
- ethers v6
- PostgreSQL
- Optional: Redis (cache only, no authority)
- Optional: S3 / MinIO (evidence storage)

NO blockchain writes.
NO private keys.
NO custodial logic.

================================================
EVENTS YOU MUST INDEX
================================================

You must listen to and index ALL of the following events:

AdCreated
AdEdited
AdCancelled
AdTaken
AdCompleted

EscrowTaken
EscrowFunded
PaymentConfirmed
EscrowReleased
EscrowCancelled

DisputeOpened
DisputeResolved

CreditAdded
CreditWithdrawn

================================================
STATE MODELS YOU MUST DERIVE
================================================

You must derive state ONLY from events.

Ad (read-model):
- adId
- maker
- isSellAd
- token
- amount
- adBond
- state
- activeEscrowId
- createdAtBlock
- updatedAtBlock

Escrow (read-model):
- escrowId
- adId
- buyer
- seller
- token
- amount
- feeAmount
- buyerDisputeBond
- sellerDisputeBond
- status
- takenAt
- fundedAt
- paymentConfirmedAt
- resolvedAt

Dispute (read-model):
- escrowId
- openedBy
- openedAt
- outcome (BUYER_WINS / SELLER_WINS)
- resolvedAt

CreditLedger (read-model):
- user
- token
- delta
- reason
- blockNumber
- txHash

================================================
DATABASE REQUIREMENTS
================================================

You must design tables for:

- ads
- escrows
- disputes
- credit_ledger
- escrow_events (full timeline)
- ad_events (full timeline)
- indexer_state (last indexed block, block hash)

All writes must be idempotent.

================================================
REORG SAFETY (MANDATORY)
================================================

You must implement:

- blockNumber + blockHash storage
- rewind logic if blockHash mismatch detected
- replay events deterministically
- no reliance on "latest" without confirmation depth

Assume up to 10 blocks reorg depth.

================================================
INDEXER ARCHITECTURE
================================================

You must implement:

1. Provider initialization
2. Contract connection using ABI
3. Event listener (historical + live)
4. Event normalization layer
5. Database upsert layer
6. Reorg detection & rollback
7. Checkpoint persistence

The indexer must be restart-safe.

================================================
OFF-CHAIN DATA STORAGE
================================================

Backend may store:
- payment instructions (encrypted or scoped)
- evidence file metadata (hash, URL, owner)
- chat messages
- notifications

Backend must enforce:
- only escrow participants, arbitrators, or admins can read private data
- no off-chain data influences on-chain outcomes

================================================
API YOU MUST EXPOSE
================================================

READ-ONLY APIs ONLY.

Required endpoints:

GET /ads
GET /ads/:adId
GET /escrows/:escrowId
GET /escrows?user=address
GET /disputes
GET /escrows/:escrowId/timeline
GET /ads/:adId/timeline
GET /credits?user=address

POST endpoints allowed ONLY for:
- evidence upload metadata
- chat messages
- notifications

================================================
FORBIDDEN
================================================

- No backend-initiated blockchain calls
- No retries that skip events
- No mutation of derived state
- No trusting frontend input for state

================================================
DELIVERABLES YOU MUST OUTPUT
================================================

You must output ALL of the following:

1. Backend folder structure
2. Database schema (SQL)
3. Event → state mapping table
4. ethers indexer setup code
5. Reorg-safe indexing loop
6. Event handlers (per event)
7. Read-model upsert logic
8. API route definitions
9. Access-control rules
10. Comments explaining why each rule exists

================================================
SUCCESS CONDITION
================================================

A developer must be able to:

- Start the indexer
- Replay from block 0
- Query ads, escrows, disputes, credits
- Trust that backend state always matches chain state

If any information is missing, stop and ask explicitly.
Otherwise, proceed and produce the full solution.
