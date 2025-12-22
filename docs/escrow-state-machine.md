# Escrow State Machine

The state machine mirrors `TrustfyEscrowV4_2.EscrowStatus`. Every transition must be verified by the indexer via chronological sorting on `blockNumber` / `logIndex`, and reads derive the “current state” from the latest timeline entry. Wallet transactions are never assumed successful until the corresponding event is indexed.

| From State | Trigger | Actor | On-chain Guard | To State | Event | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `NONE` | `createEscrow` | Seller | escrowId unused; token validation; fee check | `CREATED` | `EscrowCreated` | Seller submits metadata (amount, tokenKey, bonds) and optionally pre-assigns buyer. |
| `CREATED` | `takeEscrow` | Buyer | `escrow.status == CREATED`; buyer field empty or caller | `TAKEN` | `EscrowTaken` | Buyer locks intent; UI updates buyer view and timeline. |
| `TAKEN` | `fundEscrow` | Seller | only seller; state `TAKEN`; vault.spendCredit locks amount+fee+sellerBond | `FUNDED` | `EscrowFunded` | Amount+fee+sellerBond move to credit vault; timeline records funding block. |
| `FUNDED` | `confirmPayment` | Buyer | only buyer; state `FUNDED`; vault.spendCredit locks buyerBond | `PAYMENT_CONFIRMED` | `PaymentConfirmed` | Buyer locks bond to prove fiat side; read-model shows payment confirm status. |
| `FUNDED` or `PAYMENT_CONFIRMED` | `openDispute` | Any participant | state must be `FUNDED` or `PAYMENT_CONFIRMED` | `DISPUTED` | (no event emitted) | Transition triggered off-chain; indexer infers from absence of resolution until `EscrowResolved`. |
| `PAYMENT_CONFIRMED` | `releaseEscrow` | Seller | only seller; state `PAYMENT_CONFIRMED`; credits distributed via vault | `RESOLVED` | `EscrowResolved` (outcome `NONE`) | Platform fee is captured; seller & buyer bonds refunded to respective credits; buyer receives amount. |
| `DISPUTED` | `resolveDispute(BUYER_WINS)` | Arbitrator | only `ARBITRATOR_ROLE`; state `DISPUTED`; buyerBond vault unlock | `RESOLVED` | `EscrowResolved` (outcome `BUYER_WINS`) | Platform retains fee; seller bond retained; buyer receives amount + buyer bond refund. |
| `DISPUTED` | `resolveDispute(SELLER_WINS)` | Arbitrator | only `ARBITRATOR_ROLE`; state `DISPUTED`; sellerBond + fee refunded via vault | `RESOLVED` | `EscrowResolved` (outcome `SELLER_WINS`) | Seller receives amount + fee + seller bond; buyer bond goes to platform revenue. |
| Any resolved state | Fallback | - | - | `CANCELLED` | `EscrowCancelled` | Event not emitted yet (reserved). Indexer treats cancellation as manual override when backend metadata notes refund / rollback. |

### Reorg & Ingestion Rules

1. **Strict ordering** – timeline entries are sorted by `(blockNumber, logIndex)` before deriving `state`. Any head reorg (detect by comparing previous block numbers) triggers re-scan of the affected blocks.
2. **Checkpointing** – `IndexerCheckpoint` tracks `lastSyncedBlock` per chain/contract. The worker never advances the read-model until logs are inserted transactionally alongside timeline rows.
3. **Event gaps** – if an expected event (for example, `EscrowFunded` after `EscrowTaken`) is missing for a given escrow, the worker flags the escrow for manual review and avoids marking it as `FUNDED` until the log appears.
4. **State inference** – if `EscrowResolved` is seen without prior `PaymentConfirmed`, `Dispute` data in the backend explains the reason (seller or arbitrator triggered a resolution via dispute path).

This state machine ensures the UI reflects on-chain truth, satisfying the non-custodial policy and canonical terminology rules.
