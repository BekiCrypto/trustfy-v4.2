CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "User" (
  "address" TEXT PRIMARY KEY,
  "displayName" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "lastLoginAt" TIMESTAMPTZ
);

CREATE TABLE "Role" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "address" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "createdBy" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Role_address_role_key" UNIQUE ("address", "role"),
  CONSTRAINT "Role_address_fkey" FOREIGN KEY ("address") REFERENCES "User" ("address") ON DELETE CASCADE
);

CREATE TABLE "Escrow" (
  "escrowId" BYTEA PRIMARY KEY,
  "chainId" INTEGER NOT NULL,
  "contractAddress" TEXT NOT NULL,
  "tokenKey" TEXT NOT NULL,
  "amount" NUMERIC NOT NULL,
  "feeAmount" NUMERIC NOT NULL,
  "sellerBond" NUMERIC NOT NULL,
  "buyerBond" NUMERIC NOT NULL,
  "state" TEXT NOT NULL,
  "seller" TEXT NOT NULL,
  "buyer" TEXT,
  "createdAtBlock" BIGINT NOT NULL,
  "updatedAtBlock" BIGINT NOT NULL,
  "txHashCreate" TEXT,
  "txHashLast" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "Escrow_seller_idx" ON "Escrow" ("seller");
CREATE INDEX "Escrow_buyer_idx" ON "Escrow" ("buyer");
CREATE INDEX "Escrow_state_idx" ON "Escrow" ("state");
CREATE INDEX "Escrow_tokenKey_idx" ON "Escrow" ("tokenKey");

CREATE TABLE "EscrowTimeline" (
  "id" BIGSERIAL PRIMARY KEY,
  "escrowId" BYTEA NOT NULL,
  "chainId" INTEGER NOT NULL,
  "eventName" TEXT NOT NULL,
  "stateAfter" TEXT NOT NULL,
  "txHash" TEXT NOT NULL,
  "blockNumber" BIGINT NOT NULL,
  "logIndex" INTEGER NOT NULL,
  "timestamp" TIMESTAMPTZ NOT NULL,
  "payload" JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT "EscrowTimeline_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow" ("escrowId") ON DELETE CASCADE
);

CREATE INDEX "EscrowTimeline_escrowIdx" ON "EscrowTimeline" ("escrowId");
CREATE INDEX "EscrowTimeline_block_idx" ON "EscrowTimeline" ("blockNumber");
CREATE UNIQUE INDEX "EscrowTimeline_escrow_block_log_unique" ON "EscrowTimeline" ("escrowId", "blockNumber", "logIndex");

CREATE TABLE "EscrowMessage" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "escrowId" BYTEA,
  "sender" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "attachment" TEXT,
  "hash" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "editedAt" TIMESTAMPTZ,
  CONSTRAINT "EscrowMessage_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow" ("escrowId") ON DELETE SET NULL
);

CREATE TABLE "EscrowPaymentInstruction" (
  "escrowId" BYTEA PRIMARY KEY,
  "seller" TEXT NOT NULL,
  "content" JSONB,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "EscrowPaymentInstruction_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow" ("escrowId") ON DELETE CASCADE
);

CREATE TABLE "EscrowFiatStatus" (
  "id" BIGSERIAL PRIMARY KEY,
  "escrowId" BYTEA,
  "actor" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "EscrowFiatStatus_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow" ("escrowId") ON DELETE SET NULL
);

CREATE TABLE "EvidenceItem" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "escrowId" BYTEA,
  "uploader" TEXT NOT NULL,
  "uri" TEXT NOT NULL,
  "sha256" TEXT NOT NULL,
  "mime" TEXT NOT NULL,
  "size" BIGINT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "EvidenceItem_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow" ("escrowId") ON DELETE SET NULL
);

CREATE INDEX "EvidenceItem_escrow_idx" ON "EvidenceItem" ("escrowId");

CREATE TABLE "Dispute" (
  "escrowId" BYTEA PRIMARY KEY,
  "openedBy" TEXT NOT NULL,
  "reasonCode" TEXT,
  "summary" TEXT,
  "status" TEXT NOT NULL,
  "arbitratorAssigned" TEXT,
  "outcome" TEXT,
  "ref" BYTEA,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Dispute_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow" ("escrowId") ON DELETE CASCADE
);

CREATE INDEX "Dispute_status_idx" ON "Dispute" ("status");

CREATE TABLE "IndexerCheckpoint" (
  "chainId" INTEGER NOT NULL,
  "contractAddress" TEXT NOT NULL,
  "lastSyncedBlock" BIGINT NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("chainId", "contractAddress")
);

CREATE TABLE "TokenRegistry" (
  "chainId" INTEGER NOT NULL,
  "tokenKey" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "decimals" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY ("chainId", "tokenKey")
);

CREATE TABLE "AuditLog" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "actorAddress" TEXT,
  "action" TEXT NOT NULL,
  "target" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Nonce" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "address" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "chainId" INTEGER NOT NULL,
  "domain" TEXT,
  "issuedAt" TIMESTAMPTZ NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "used" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "Nonce_address_idx" ON "Nonce" ("address");
CREATE INDEX "Nonce_used_idx" ON "Nonce" ("used");
CREATE UNIQUE INDEX "Nonce_address_value_key" ON "Nonce" ("address", "value");
