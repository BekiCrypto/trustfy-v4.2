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
import { useWalletGuard } from "@/components/web3/useWalletGuard";
import { useTranslation } from "react-i18next";
import { useWallet } from "@/components/web3/WalletContext";

/**
 * AcceptOfferModal - Complete order summary and escrow creation flow
 * Handles validation, eligibility checks, and escrow creation
 */
export default function AcceptOfferModal({ offer, open, onOpenChange }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { ensureWallet, authModal } = useWalletGuard();
  const { getTokenConfig } = useWallet();
  const [tradeAmount, setTradeAmount] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [tokenConfig, setTokenConfig] = useState(null);
  const [configError, setConfigError] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: myProfile } = useQuery({
    queryKey: ['my-profile', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return null;
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: currentUser.email });
      return profiles[0] ?? null;
    },
    enabled: !!currentUser
  });

  const { data: creatorProfile } = useQuery({
    queryKey: ['creator-profile', offer?.creator_address],
    queryFn: async () => {
      if (!offer) return null;
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: offer.creator_address });
      return profiles[0] ?? null;
    },
    enabled: !!offer
  });

  React.useEffect(() => {
    const loadConfig = async () => {
      if (!offer) return;
      try {
        const cfg = await getTokenConfig(offer.chain, offer.token_symbol);
        setTokenConfig(cfg);
        setConfigError(cfg?.configUnavailable ? (cfg.error || 'Token config unavailable') : null);
      } catch (error) {
        setConfigError(error?.message || 'Token config unavailable');
        setTokenConfig(null);
      }
    };
    loadConfig();
  }, [offer, getTokenConfig]);

  const disputeBondPreview =
    tokenConfig?.disputeBondBps && tradeAmount
      ? ((Number(tradeAmount) || 0) * tokenConfig.disputeBondBps) / 10_000
      : 0;

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
        errors.amount = t('marketplace.accept.errors.amountPositive');
      } else if (amount < minAmount) {
        errors.amount = t('marketplace.accept.errors.amountMin', {
          minAmount: minAmount.toLocaleString(),
          token: offer.token_symbol
        });
      } else if (amount > maxAmount) {
        errors.amount = t('marketplace.accept.errors.amountMax', {
          maxAmount: maxAmount.toLocaleString(),
          token: offer.token_symbol
        });
      } else if (amount > remaining) {
        errors.amount = t('marketplace.accept.errors.amountRemaining', {
          remaining: remaining.toLocaleString(),
          token: offer.token_symbol
        });
      }

      // Check reputation requirements
      if (offer.requirements?.min_reputation && myProfile) {
        if (myProfile.reputation_score < offer.requirements.min_reputation) {
          errors.reputation = t('marketplace.accept.errors.minReputation', {
            minReputation: offer.requirements.min_reputation
          });
        }
      }

      // Check KYC requirements
      if (offer.requirements?.kyc_required && myProfile) {
        if (myProfile.kyc_status !== 'verified') {
          errors.kyc = t('marketplace.accept.errors.kycRequired');
        }
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        throw new Error(Object.values(errors)[0]);
      }

      // Generate escrow ID
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

      // Create escrow
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
        terms: offer.notes || t('marketplace.accept.defaultTerms', {
          currency: offer.fiat_currency,
          price: offer.price_per_unit,
          token: offer.token_symbol
        })
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
      toast.success(t('marketplace.accept.successTitle'), {
        description: isSeller 
          ? t('marketplace.accept.successSellerNext')
          : t('marketplace.accept.successBuyerNext')
      });
      
      onOpenChange(false);
      navigate(createPageUrl(`TradeDetails?id=${trade.id}`));
    },
    onError: (error) => {
      console.error('Trade creation error:', error);
      toast.error(error.message || t('marketplace.accept.errors.createFailed'));
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
    if (offer.status !== 'open') {
      toast.error('This Ad is no longer available.');
      return;
    }
    if (configError || tokenConfig?.enabled === false) {
      toast.error('Token is disabled or config unavailable');
      return;
    }
    if (!agreeToTerms) {
      toast.error(t('marketplace.accept.errors.agreeTerms'));
      return;
    }
    ensureWallet(() => {
      createTrade.mutate({ amount: parseFloat(tradeAmount) });
    });
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
            {isBuyOffer
              ? t('marketplace.accept.titleSell', { token: offer.token_symbol })
              : t('marketplace.accept.titleBuy', { token: offer.token_symbol })}
          </DialogTitle>
          <p className="text-slate-400 text-sm">
            {userRole === 'seller'
              ? t('marketplace.accept.roleSeller')
              : t('marketplace.accept.roleBuyer')}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Offer Creator Info */}
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-400">{t('marketplace.accept.tradingWith')}</p>
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
                <p className="font-semibold mb-2">{t('marketplace.accept.requirementsTitle')}</p>
                <ul className="space-y-1 text-xs">
                  {offer.requirements?.min_reputation > 0 && (
                    <li className="flex items-center gap-2">
                      {myProfile && myProfile.reputation_score >= offer.requirements.min_reputation ? (
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                      )}
                      <span>{t('marketplace.accept.minimumReputation', { minReputation: offer.requirements.min_reputation })}</span>
                    </li>
                  )}
                  {offer.requirements?.kyc_required && (
                    <li className="flex items-center gap-2">
                      {myProfile?.kyc_status === 'verified' ? (
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                      )}
                      <span>{t('marketplace.accept.kycRequired')}</span>
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Escrow Amount */}
          <div>
            <Label className="text-sm text-slate-300 mb-2 block">
              {t('marketplace.accept.escrowAmountLabel', { token: offer.token_symbol })}
            </Label>
            <Input
              type="number"
              step="0.01"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              className={`bg-slate-800 border-slate-700 ${validationErrors.amount ? 'border-red-500' : ''}`}
              placeholder={t('marketplace.accept.amountPlaceholder', {
                minAmount: minAmount.toLocaleString(),
                maxAmount: maxAmount.toLocaleString()
              })}
            />
            {validationErrors.amount && (
              <p className="text-xs text-red-400 mt-1">⚠ {validationErrors.amount}</p>
            )}
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>{t('marketplace.accept.amountMin', { minAmount: minAmount.toLocaleString(), token: offer.token_symbol })}</span>
              <span>{t('marketplace.accept.amountMax', { maxAmount: maxAmount.toLocaleString(), token: offer.token_symbol })}</span>
            </div>
          </div>

          {/* Escrow Summary */}
          {amount > 0 && (
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-4">
              <p className="text-sm text-blue-400 mb-3 font-semibold">{t('marketplace.accept.summaryTitle')}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    {userRole === 'seller'
                      ? t('marketplace.accept.youSend')
                      : t('marketplace.accept.youReceive')}
                  </span>
                  <span className="text-white font-semibold">
                    {amount.toLocaleString()} {offer.token_symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('marketplace.accept.pricePerUnit')}</span>
                  <span className="text-white">
                    {offer.fiat_currency} {offer.price_per_unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('marketplace.accept.baseAmount')}</span>
                  <span className="text-white">
                    {offer.fiat_currency} {estimatedFiat.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-700/50 flex justify-between">
                  <span className="text-slate-300 font-semibold">
                    {userRole === 'buyer'
                      ? t('marketplace.accept.youPay')
                      : t('marketplace.accept.youReceive')}
                  </span>
                  <span className="text-white font-bold text-lg">
                    {offer.fiat_currency} {totalFiatCost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-400 pt-2">
                  Fees and bonds are enforced on-chain. This is a preview only.
                </p>
              </div>
            </Card>
          )}

          {/* Payment Methods */}
          {offer.payment_methods && offer.payment_methods.length > 0 && (
            <div>
              <p className="text-sm text-slate-300 mb-2">{t('marketplace.accept.paymentMethods')}</p>
              <div className="space-y-2">
                {offer.payment_methods.slice(0, 3).map((method, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-800/50 border border-slate-700 text-sm text-slate-300">
                    <CreditCard className="w-3 h-3 inline mr-2 text-blue-400" />
                    {method.split(':')[0]}
                  </div>
                ))}
                {offer.payment_methods.length > 3 && (
                  <p className="text-xs text-slate-500">
                    {t('marketplace.accept.moreMethods', { count: offer.payment_methods.length - 3 })}
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
                <strong>{t('marketplace.accept.termsLabel')}</strong> {offer.notes}
              </AlertDescription>
            </Alert>
          )}

          {/* DisputeBond Notice */}
          <Alert className="bg-purple-500/10 border-purple-500/30">
            <Shield className="h-4 w-4 text-purple-400" />
            <AlertDescription className="text-purple-300 text-sm">
              <strong>DisputeBond at Take:</strong> Taking an Ad locks the Buyer DisputeBond on-chain. Only one taker is allowed and the Ad moves to TAKEN immediately.
              Failure to proceed may forfeit the DisputeBond. The losing party forfeits their DisputeBond to the Treasury if a dispute is resolved against them.
            </AlertDescription>
          </Alert>

          {disputeBondPreview > 0 && (
            <div className="text-xs text-purple-300">
              DisputeBond preview: {disputeBondPreview.toFixed(4)} {offer.token_symbol}
            </div>
          )}

          {configError && (
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
              Token config unavailable. Taking this Ad is disabled.
            </div>
          )}

          {tokenConfig && tokenConfig.enabled === false && (
            <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              This token is disabled by admin. Taking is blocked.
            </div>
          )}

          {/* Agreement Checkbox */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={setAgreeToTerms}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-sm text-slate-300 cursor-pointer">
              {t('marketplace.accept.agreement')}
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
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={createTrade.isPending || !agreeToTerms || !tradeAmount || tokenConfig?.enabled === false || !!configError}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {createTrade.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('marketplace.accept.creatingEscrow')}
                </>
              ) : (
                <>
                  {t('marketplace.accept.createEscrow')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
      {authModal}
    </Dialog>
  );
}
