/*
  Warnings:

  - The primary key for the `AuditLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `amount` on the `Escrow` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,30)`.
  - You are about to alter the column `feeAmount` on the `Escrow` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,30)`.
  - You are about to alter the column `sellerBond` on the `Escrow` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,30)`.
  - You are about to alter the column `buyerBond` on the `Escrow` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,30)`.
  - The primary key for the `EscrowMessage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `EvidenceItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Nonce` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Dispute" DROP CONSTRAINT "Dispute_escrowId_fkey";

-- DropForeignKey
ALTER TABLE "EscrowFiatStatus" DROP CONSTRAINT "EscrowFiatStatus_escrowId_fkey";

-- DropForeignKey
ALTER TABLE "EscrowMessage" DROP CONSTRAINT "EscrowMessage_escrowId_fkey";

-- DropForeignKey
ALTER TABLE "EscrowPaymentInstruction" DROP CONSTRAINT "EscrowPaymentInstruction_escrowId_fkey";

-- DropForeignKey
ALTER TABLE "EscrowTimeline" DROP CONSTRAINT "EscrowTimeline_escrowId_fkey";

-- DropForeignKey
ALTER TABLE "EvidenceItem" DROP CONSTRAINT "EvidenceItem_escrowId_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_address_fkey";

-- AlterTable
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Dispute" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Escrow" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "feeAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "sellerBond" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "buyerBond" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "EscrowFiatStatus" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "EscrowMessage" DROP CONSTRAINT "EscrowMessage_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "editedAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "EscrowMessage_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "EscrowPaymentInstruction" ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "EscrowTimeline" ALTER COLUMN "timestamp" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "payload" DROP DEFAULT;

-- AlterTable
ALTER TABLE "EvidenceItem" DROP CONSTRAINT "EvidenceItem_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "EvidenceItem_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "IndexerCheckpoint" ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Nonce" DROP CONSTRAINT "Nonce_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "issuedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "expiresAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "Nonce_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "lastLoginAt" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "address" TEXT NOT NULL,
    "webhookUrl" TEXT,
    "email" TEXT,
    "telegramId" TEXT,
    "smsNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("address")
);

-- CreateIndex
CREATE INDEX "NotificationPreference_address_idx" ON "NotificationPreference"("address");

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_address_fkey" FOREIGN KEY ("address") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowTimeline" ADD CONSTRAINT "EscrowTimeline_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow"("escrowId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowMessage" ADD CONSTRAINT "EscrowMessage_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow"("escrowId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowPaymentInstruction" ADD CONSTRAINT "EscrowPaymentInstruction_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow"("escrowId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowFiatStatus" ADD CONSTRAINT "EscrowFiatStatus_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow"("escrowId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow"("escrowId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow"("escrowId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_address_fkey" FOREIGN KEY ("address") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "EscrowTimeline_block_idx" RENAME TO "EscrowTimeline_blockNumber_idx";

-- RenameIndex
ALTER INDEX "EscrowTimeline_escrowIdx" RENAME TO "EscrowTimeline_escrowId_idx";

-- RenameIndex
ALTER INDEX "EscrowTimeline_escrow_block_log_unique" RENAME TO "EscrowTimeline_escrowId_blockNumber_logIndex_key";

-- RenameIndex
ALTER INDEX "EvidenceItem_escrow_idx" RENAME TO "EvidenceItem_escrowId_idx";
