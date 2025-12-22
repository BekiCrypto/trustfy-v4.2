# Canonical Language Map

This table aligns every customer-facing term with the contract sources, API fields, and database columns so UI, backend, and indexer code reuse the same vocabulary.

## Core Ledger Terms
| PRD Term | UI Label | API Field | DB Field | Contract Element | Notes |
| --- | --- | --- | --- | --- | --- |
| Escrow | Escrow | `escrowId` | `Escrow.escrowId` | `EscrowCreated.escrowId` (event) | bytes32 trade identifier used for all lookups |
| Seller | Seller | `seller` | `Escrow.seller` | `TrustfyEscrowV4_2.escrows(…).seller` | Creator of the trade, funds escrow |
| Buyer | Buyer | `buyer` | `Escrow.buyer` | `TrustfyEscrowV4_2.escrows(…).buyer` | Fulfills escrow when taking an offer |
| TokenKey | TokenKey | `tokenKey` | `Escrow.tokenKey` | `TrustfyEscrowV4_2.escrows(…).tokenKey` | `address(0)` = native coin, else ERC20 |
| Amount | Amount | `amount` | `Escrow.amount` | `TrustfyEscrowV4_2.escrows(…).amount` | Principal crypto locked on-chain |
| FeeAmount | FeeAmount | `feeAmount` | `Escrow.feeAmount` | Calculated in `createEscrow` | Platform service fee |
| SellerBond | Seller Bond | `sellerBond` | `Escrow.sellerBond` | `TrustfyEscrowV4_2.escrows(…).sellerBond` | Lock incentivizing seller honesty |
| BuyerBond | Buyer Bond | `buyerBond` | `Escrow.buyerBond` | `TrustfyEscrowV4_2.escrows(…).buyerBond` | Lock incentivizing buyer honesty |
| PaymentWindow | Payment Window | `paymentWindow` | `Escrow.paymentWindow` (stored on-chain via struct) | `createEscrow` payload | Fiat payment deadline |
| ReleaseWindow | Release Window | `releaseWindow` | `Escrow.releaseWindow` | `createEscrow` payload | Seller release window |
| Dispute | Dispute Case | `dispute` | `Dispute` | `EscrowResolved` + manual metadata | Derived from on-chain state plus `Dispute` rows |

## Enumerations & Lifecycle Terms
| PRD Term | UI Label | API Field | DB Field | Contract Element | Notes |
| --- | --- | --- | --- | --- | --- |
| State (`EscrowStatus`) | State | `state` | `Escrow.state` / `EscrowTimeline.stateAfter` | `TrustfyEscrowV4_2.EscrowStatus` enum | Values: `CREATED`, `TAKEN`, `FUNDED`, `PAYMENT_CONFIRMED`, `DISPUTED`, `RESOLVED`, `CANCELLED` |
| DisputeOutcome | Outcome | `outcome` | `Dispute.outcome` | `TrustfyEscrowV4_2.DisputeOutcome` enum + `EscrowResolved` event param | `BUYER_WINS`, `SELLER_WINS`, `NONE` |
| Timeline Event | Timeline | `eventName` | `EscrowTimeline.eventName` | Contract events: `EscrowCreated`, `EscrowTaken`, `EscrowFunded`, `PaymentConfirmed`, `EscrowResolved`, `EscrowCancelled` | Drives read-model state |
| Indexer Checkpoint | Indexer Status | `lastSyncedBlock`, `lagBlocks` | `IndexerCheckpoint` | Off-chain bookkeeping | Used by UI sync bar |

## Supporting References
| PRD Term | UI Label | API Field | DB Field | Contract Element | Notes |
| --- | --- | --- | --- | --- | --- |
| Message | Chat | `text` | `EscrowMessage.text` | n/a | Off-chain chat stored in DB, uses canonical sender address |
| Evidence | Evidence | `uri`, `sha256` | `EvidenceItem` | n/a | Stored via object storage, integrity sha256 validated |
| Payment Instructions | Payment Instructions | `contentJson` | `EscrowPaymentInstruction.content` | n/a | Seller-managed JSON blob |
| Fiat Status | Fiat Status | `status`, `note` | `EscrowFiatStatus.status` | n/a | Tracks buyer/seller payment routing |
| Audit Log | Audit Trail | `action`, `target` | `AuditLog` | n/a | Captures privileged mutations |

