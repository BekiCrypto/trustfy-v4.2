-- CreateTable
CREATE TABLE "ReferralCode" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "referralLink" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrerAddress" TEXT NOT NULL,
    "refereeAddress" TEXT NOT NULL,
    "referralCodeId" TEXT NOT NULL,
    "qualified" BOOLEAN NOT NULL DEFAULT false,
    "qualifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionLedger" (
    "id" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "feeAmount" DECIMAL(65,30) NOT NULL,
    "commissionRate" DECIMAL(65,30) NOT NULL,
    "commissionAmount" DECIMAL(65,30) NOT NULL,
    "feeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralWallet" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralWalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "targetAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralWalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrimeStatus" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "isPrime" BOOLEAN NOT NULL DEFAULT false,
    "primeActivatedAt" TIMESTAMP(3),
    "referralCount" INTEGER NOT NULL DEFAULT 0,
    "qualifiedReferralCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrimeStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralConfig" (
    "id" TEXT NOT NULL,
    "commissionRate" DECIMAL(65,30) NOT NULL DEFAULT 0.20,
    "eligibleFeeTypes" TEXT NOT NULL DEFAULT 'maker,taker',
    "primeUnlockThreshold" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferralCode_code_key" ON "ReferralCode"("code");

-- CreateIndex
CREATE INDEX "Referral_referrerAddress_idx" ON "Referral"("referrerAddress");

-- CreateIndex
CREATE INDEX "Referral_refereeAddress_idx" ON "Referral"("refereeAddress");

-- CreateIndex
CREATE INDEX "CommissionLedger_referralId_idx" ON "CommissionLedger"("referralId");

-- CreateIndex
CREATE INDEX "ReferralWallet_address_idx" ON "ReferralWallet"("address");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralWallet_address_key" ON "ReferralWallet"("address");

-- CreateIndex
CREATE INDEX "ReferralWalletTransaction_walletId_idx" ON "ReferralWalletTransaction"("walletId");

-- CreateIndex
CREATE INDEX "PrimeStatus_address_idx" ON "PrimeStatus"("address");

-- CreateIndex
CREATE UNIQUE INDEX "PrimeStatus_address_key" ON "PrimeStatus"("address");

-- AddForeignKey
ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_address_fkey" FOREIGN KEY ("address") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerAddress_fkey" FOREIGN KEY ("referrerAddress") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_refereeAddress_fkey" FOREIGN KEY ("refereeAddress") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "ReferralCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionLedger" ADD CONSTRAINT "CommissionLedger_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Referral"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralWallet" ADD CONSTRAINT "ReferralWallet_address_fkey" FOREIGN KEY ("address") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralWalletTransaction" ADD CONSTRAINT "ReferralWalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "ReferralWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrimeStatus" ADD CONSTRAINT "PrimeStatus_address_fkey" FOREIGN KEY ("address") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
