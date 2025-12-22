# TRUSTFY UI FINAL ACCEPTANCE TEST CHECKLIST (v4.2 Amended)

Purpose: Manual end-to-end UI validation of core PRD flows (create → take → fund → confirm → release, plus dispute).

Notes:
- These steps validate UI behavior against on-chain/Indexer-backed state, not off-chain assumptions.
- Use two distinct wallets: Seller (Maker) and Buyer (Taker). Arbitrator wallet required for dispute resolution.
- All confirmations should reflect on-chain state transitions via the indexer.

## Results (fill after each run)
- [ ] Run date/time:
- [ ] Environment (chain/network):
- [ ] API base URL:
- [ ] UI build/commit:
- [ ] Notes:

## Preconditions
- [ ] UI is running and points to the correct API and chain RPC.
- [ ] Indexer is running and synced for the target chain.
- [ ] Contract address is configured for the target chain.
- [ ] Admin token config exists and token is enabled.

## A. Create Ad (Maker/Seller)
1. Connect as Seller wallet.
2. Navigate to Create Ad / Create Trade.
3. Select token, amount, ad type (Buy or Sell).
4. Verify AdBond preview appears and warning is shown.
5. Submit create action.
Expected:
- [ ] UI shows Ad CREATED state.
- [ ] Ad appears in marketplace with CREATED badge.
- [ ] If token disabled, UI blocks creation with clear message.

## B. Take Ad (Taker/Buyer)
1. Disconnect Seller wallet; connect as Buyer wallet.
2. Navigate to marketplace and open the created Ad.
3. Select take/accept action.
4. Verify DisputeBond preview and warning appears.
5. Confirm take action.
Expected:
- [ ] Ad transitions to TAKEN.
- [ ] Ad is not available for other takers.
- [ ] Seller receives UI notification cue or status change.

## C. Fund Escrow (Seller)
1. Switch back to Seller wallet.
2. Open the TAKEN Ad / Trade detail page.
3. Trigger Fund Escrow action.
4. Verify preview shows:
   - Trade amount
   - Platform fees (maker + taker)
   - Seller DisputeBond
5. Confirm funding.
Expected:
- [ ] Trade transitions to FUNDED.
- [ ] Buyer action is now enabled.
- [ ] Funding timer starts and displays.

## D. Buyer Payment Confirmation
1. Switch to Buyer wallet.
2. Open trade detail page.
3. Verify “Confirm Payment” is enabled only after FUNDED.
4. (Optional) Upload evidence.
5. Confirm Payment action.
Expected:
- [ ] Trade transitions to PAYMENT_CONFIRMED.
- [ ] Buyer timer shows and warns about deadline.
- [ ] Dispute action becomes available (per PRD timing).

## E. Seller Release
1. Switch to Seller wallet.
2. Open trade detail page.
3. Trigger Release Escrow action.
4. Verify irreversible warning is shown.
5. Confirm release.
Expected:
- [ ] Trade transitions to RESOLVED/COMPLETED.
- [ ] UI shows finality and read-only state.
- [ ] Fees/bonds described as settled (no off-chain enforcement).

## F. Dispute Flow (Valid Window)
1. Repeat steps A–D to reach PAYMENT_CONFIRMED state.
2. From Buyer or Seller wallet, open dispute.
3. Provide reason/summary and confirm.
Expected:
- [ ] Dispute created, trade moves to DISPUTED.
- [ ] Only one dispute allowed; subsequent attempts blocked.
- [ ] UI shows DisputeBond consequence warning.

## G. Dispute Resolution (Arbitrator)
1. Switch to Arbitrator wallet.
2. Open the dispute detail.
3. Review timeline and evidence.
4. Resolve dispute (Buyer wins or Seller wins).
Expected:
- [ ] Dispute marked RESOLVED.
- [ ] Trade state updated to RESOLVED.
- [ ] UI reflects winner/loser and bond forfeit to treasury.

## H. Role and Wallet Guards
- [ ] Actions blocked when wallet not connected (prompt shown).
- [ ] Wrong network blocked with clear message.
- [ ] Admin-only actions restricted to ADMIN role.
- [ ] Arbitrator-only actions restricted to ARBITRATOR role.

## I. Public Access
- [ ] Marketplace shows CREATED ads without wallet connection.
- [ ] No auto wallet connect on Home / Launch App.

## Outcome
- [ ] All core flows pass without UI regressions.
- [ ] No action contradicts PRD or contract rules.
