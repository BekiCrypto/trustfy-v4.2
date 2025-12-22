import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  ArrowRight,
  CreditCard,
  Lock,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { createNotification, NotificationTemplates } from "../notifications/notificationHelpers";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import WalletAddress from "../common/WalletAddress";
import ReputationBadge from "../common/ReputationBadge";

/**
 * AcceptOfferModal - Complete order summary and trade creation flow
 * Handles validation, eligibility checks, and trade creation
 */
export default function AcceptOfferModal({ offer, open, onOpenChange }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tradeAmount, setTradeAmount] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: myProfile } = useQuery({
    queryKey: ['my-profile', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return null;
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: currentUser.email });
      return profiles[0];
    },
    enabled: !!currentUser
  });

  const { data: creatorProfile } = useQuery({
    queryKey: ['creator-profile', offer?.creator_address],
    queryFn: async () => {
      if (!offer) return null;
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: offer.creator_address });
      return profiles[0];
    },
    enabled: !!offer
  });

  // Reset state when modal opens
  React.useEffect(() => {
    if (open && offer) {
      const remaining = offer.amount - (offer.filled_amount || 0);
      const maxAllowed = Math.min(
        remaining,
        offer.max_trade_amount || remaining
      );
      setTradeAmount(maxAllowed.toString());
      setAgreeToTerms(false);
      setValidationErrors({});
    }
  }, [open, offer]);

  const createTrade = useMutation({
    mutationFn: async (data) => {
      // Validation
      const errors = {};
      const amount = parseFloat(data.amount);
      const remaining = offer.amount - (offer.filled_amount || 0);
      const minAmount = offer.min_trade_amount || (offer.amount * 0.1);
      const maxAmount = offer.max_trade_amount || remaining;

      if (!amount || amount <= 0) {
        errors.amount = 'Amount must be greater than 0';
      } else if (amount < minAmount) {
        errors.amount = `Minimum trade amount is ${minAmount} ${offer.token_symbol}`;
      } else if (amount > maxAmount) {
        errors.amount = `Maximum trade amount is ${maxAmount} ${offer.token_symbol}`;
      } else if (amount > remaining) {
        errors.amount = `Only ${remaining} ${offer.token_symbol} available`;
      }

      // Check reputation requirements
      if (offer.requirements?.min_reputation && myProfile) {
        if (myProfile.reputation_score < offer.requirements.min_reputation) {
          errors.reputation = `Requires minimum reputation of ${offer.requirements.min_reputation}`;
        }
      }

      // Check KYC requirements
      if (offer.requirements?.kyc_required && myProfile) {
        if (myProfile.kyc_status !== 'verified') {
          errors.kyc = 'KYC verification required for this offer';
        }
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        throw new Error(Object.values(errors)[0]);
      }

      // Generate trade ID
      const tradeId = `0xT${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      // Determine roles based on offer type
      const sellerAddress = offer.offer_type === 'sell' ? offer.creator_address : currentUser.email;
      const buyerAddress = offer.offer_type === 'buy' ? offer.creator_address : currentUser.email;

      // Get profiles for fee calculation
      const sellerProfile = sellerAddress === currentUser.email ? myProfile : creatorProfile;
      const buyerProfile = buyerAddress === currentUser.email ? myProfile : creatorProfile;

      // Calculate fees with discounts
      const baseMakerFee = 1.0;
      const baseTakerFee = 1.5;
      const makerDiscount = sellerProfile?.maker_fee_discount || 0;
      const takerDiscount = buyerProfile?.taker_fee_discount || 0;
      const makerFee = Math.max(0.1, baseMakerFee - makerDiscount);
      const takerFee = Math.max(0.1, baseTakerFee - takerDiscount);

      // Calculate amounts
      const escrowAmount = amount * (1 + (makerFee + takerFee) / 100);
      const buyerFiatAmount = amount * offer.price_per_unit;
      const buyerFeeInFiat = buyerFiatAmount * (takerFee / 100);
      const totalFiatAmount = buyerFiatAmount + buyerFeeInFiat;

      // Create trade
      const trade = await base44.entities.Trade.create({
        trade_id: tradeId,
        seller_address: sellerAddress,
        buyer_address: buyerAddress,
        token_symbol: offer.token_symbol,
        token_address: offer.token_address,
        amount: amount,
        chain: offer.chain,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        timeout_duration: 48,
        seller_signed: false,
        buyer_signed: false,
        is_insured: false,
        insurance_premium: 0,
        maker_fee: makerFee,
        taker_fee: takerFee,
        price_per_unit: offer.price_per_unit,
        fiat_currency: offer.fiat_currency,
        total_fiat_amount: totalFiatAmount,
        escrow_amount: escrowAmount,
        payment_methods: offer.payment_methods || [],
        terms: offer.notes || `Trade from marketplace offer. Rate: ${offer.fiat_currency} ${offer.price_per_unit} per ${offer.token_symbol}.`
      });

      // Update offer
      await base44.entities.TradeOffer.update(offer.id, {
        filled_amount: (offer.filled_amount || 0) + amount,
        status: ((offer.filled_amount || 0) + amount) >= offer.amount ? 'matched' : 'partially_filled',
        matched_trade_ids: [...(offer.matched_trade_ids || []), trade.id]
      });

      // Send notifications
      await Promise.all([
        createNotification({
          userAddress: sellerAddress,
          ...NotificationTemplates.tradeMatched(trade.id, amount, offer.token_symbol),
          metadata: { trade_id: trade.id, offer_id: offer.id, role: 'seller' }
        }),
        createNotification({
          userAddress: buyerAddress,
          ...NotificationTemplates.tradeMatched(trade.id, amount, offer.token_symbol),
          metadata: { trade_id: trade.id, offer_id: offer.id, role: 'buyer' }
        })
      ]);

      return trade;
    },
    onSuccess: (trade) => {
      queryClient.invalidateQueries({ queryKey: ['trade-offers'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['my-offers'] });
      
      const isSeller = trade.seller_address === currentUser.email;
      toast.success('Trade created successfully!', {
        description: isSeller 
          ? 'Next: Fund escrow & lock bond' 
          : 'Next: Wait for seller to fund escrow'
      });
      
      onOpenChange(false);
      navigate(createPageUrl(`TradeDetails?id=${trade.id}`));
    },
    onError: (error) => {
      console.error('Trade creation error:', error);
      toast.error(error.message || 'Failed to create trade');
    }
  });

  if (!offer) return null;

  const remaining = offer.amount - (offer.filled_amount || 0);
  const minAmount = offer.min_trade_amount || (offer.amount * 0.1);
  const maxAmount = Math.min(offer.max_trade_amount || remaining, remaining);
  const isBuyOffer = offer.offer_type === 'buy';
  const userRole = isBuyOffer ? 'seller' : 'buyer';
  
  // Calculate estimated amounts
  const amount = parseFloat(tradeAmount) || 0;
  const estimatedFiat = amount * offer.price_per_unit;
  const baseTakerFee = 1.5;
  const takerDiscount = myProfile?.taker_fee_discount || 0;
  const effectiveTakerFee = Math.max(0.1, baseTakerFee - takerDiscount);
  const buyerFeeInFiat = estimatedFiat * (effectiveTakerFee / 100);
  const totalFiatCost = estimatedFiat + buyerFeeInFiat;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreeToTerms) {
      toast.error('Please agree to the trade terms');
      return;
    }
    createTrade.mutate({ amount: parseFloat(tradeAmount) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-white flex items-center gap-3">
            {isBuyOffer ? (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
            )}
            {isBuyOffer ? 'Sell' : 'Buy'} {offer.token_symbol}
          </DialogTitle>
          <p className="text-slate-400 text-sm">
            You're {userRole === 'seller' ? 'selling crypto for fiat' : 'buying crypto with fiat'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Offer Creator Info */}
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-400">Trading with</p>
              {creatorProfile && (
                <ReputationBadge profile={creatorProfile} showScore={true} size="sm" />
              )}
            </div>
            <WalletAddress address={offer.creator_address} truncate={false} showCopy />
          </Card>

          {/* Eligibility Checks */}
          {(offer.requirements?.min_reputation > 0 || offer.requirements?.kyc_required) && (
            <Alert className={`${
              validationErrors.reputation || validationErrors.kyc 
                ? 'bg-red-500/10 border-red-500/30' 
                : 'bg-blue-500/10 border-blue-500/30'
            }`}>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <p className="font-semibold mb-2">Requirements:</p>
                <ul className="space-y-1 text-xs">
                  {offer.requirements?.min_reputation > 0 && (
                    <li className="flex items-center gap-2">
                      {myProfile && myProfile.reputation_score >= offer.requirements.min_reputation ? (
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                      )}
                      <span>Minimum reputation: {offer.requirements.min_reputation}</span>
                    </li>
                  )}
                  {offer.requirements?.kyc_required && (
                    <li className="flex items-center gap-2">
                      {myProfile?.kyc_status === 'verified' ? (
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                      )}
                      <span>KYC verification required</span>
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Trade Amount */}
          <div>
            <Label className="text-sm text-slate-300 mb-2 block">
              Trade Amount ({offer.token_symbol}) *
            </Label>
            <Input
              type="number"
              step="0.01"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              className={`bg-slate-800 border-slate-700 ${validationErrors.amount ? 'border-red-500' : ''}`}
              placeholder={`Min: ${minAmount}, Max: ${maxAmount}`}
            />
            {validationErrors.amount && (
              <p className="text-xs text-red-400 mt-1">⚠ {validationErrors.amount}</p>
            )}
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>Min: {minAmount.toLocaleString()} {offer.token_symbol}</span>
              <span>Max: {maxAmount.toLocaleString()} {offer.token_symbol}</span>
            </div>
          </div>

          {/* Order Summary */}
          {amount > 0 && (
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-4">
              <p className="text-sm text-blue-400 mb-3 font-semibold">Order Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">You {userRole === 'seller' ? 'send' : 'receive'}</span>
                  <span className="text-white font-semibold">
                    {amount.toLocaleString()} {offer.token_symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Price per unit</span>
                  <span className="text-white">
                    {offer.fiat_currency} {offer.price_per_unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Base amount</span>
                  <span className="text-white">
                    {offer.fiat_currency} {estimatedFiat.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">
                    {userRole === 'buyer' ? 'Buyer' : 'Seller'} fee ({effectiveTakerFee}%)
                  </span>
                  <span className="text-slate-400">
                    {offer.fiat_currency} {buyerFeeInFiat.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-700/50 flex justify-between">
                  <span className="text-slate-300 font-semibold">
                    You {userRole === 'buyer' ? 'pay' : 'receive'}
                  </span>
                  <span className="text-white font-bold text-lg">
                    {offer.fiat_currency} {totalFiatCost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Payment Methods */}
          {offer.payment_methods && offer.payment_methods.length > 0 && (
            <div>
              <p className="text-sm text-slate-300 mb-2">Payment Methods</p>
              <div className="space-y-2">
                {offer.payment_methods.slice(0, 3).map((method, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-800/50 border border-slate-700 text-sm text-slate-300">
                    <CreditCard className="w-3 h-3 inline mr-2 text-blue-400" />
                    {method.split(':')[0]}
                  </div>
                ))}
                {offer.payment_methods.length > 3 && (
                  <p className="text-xs text-slate-500">
                    +{offer.payment_methods.length - 3} more methods
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Terms & Notes */}
          {offer.notes && (
            <Alert className="bg-slate-800/50 border-slate-700">
              <Info className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-slate-300 text-sm">
                <strong>Terms:</strong> {offer.notes}
              </AlertDescription>
            </Alert>
          )}

          {/* Bond Notice */}
          <Alert className="bg-purple-500/10 border-purple-500/30">
            <Shield className="h-4 w-4 text-purple-400" />
            <AlertDescription className="text-purple-300 text-sm">
              <strong>Symmetric Bond Escrow:</strong> Both parties lock refundable bonds (~10% of trade value) to ensure honest behavior. Bonds are fully refunded on successful completion.
            </AlertDescription>
          </Alert>

          {/* Agreement Checkbox */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={setAgreeToTerms}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-sm text-slate-300 cursor-pointer">
              I understand the trade terms, bond requirements, and agree to complete this transaction honestly. 
              I acknowledge that dishonest behavior may result in bond forfeiture.
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createTrade.isPending}
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTrade.isPending || !agreeToTerms || !tradeAmount}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {createTrade.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Trade...
                </>
              ) : (
                <>
                  Create Trade
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}