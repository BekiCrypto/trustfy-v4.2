import React, { useMemo } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, TrendingUp, TrendingDown, Shield, Info } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import WalletAddress from "../common/WalletAddress";
import ChainBadge from "../common/ChainBadge";
import ReputationBadge from "../common/ReputationBadge";
import { createNotification, NotificationTemplates } from "../notifications/notificationHelpers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWalletGuard } from "@/components/web3/useWalletGuard";
import { useTranslation } from '@/hooks/useTranslation';

export default function MatchedOffersModal({ open, onOpenChange, offer, allOffers = [] }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { ensureWallet, authModal } = useWalletGuard();
  const { t } = useTranslation();
  
  const { data: profiles = [] } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: () => base44.entities.UserProfile.list()
  });
  
  const profileMap = React.useMemo(() => {
    return profiles.reduce((acc, profile) => {
      acc[profile.wallet_address] = profile;
      return acc;
    }, {});
  }, [profiles]);
  
  // Find matching offers
  const matches = useMemo(() => {
    if (!offer) return [];
    
    // Match opposite type offers with same token and chain
    return allOffers.filter(o => {
      if (o.id === offer.id) return false;
      if (o.offer_type === offer.offer_type) return false;
      if (o.token_symbol !== offer.token_symbol) return false;
      if (o.chain !== offer.chain) return false;
      if (o.status !== 'open') return false;
      
      // Price matching logic
      if (offer.offer_type === 'buy') {
        // If I want to buy, match with sellers at or below my price
        return o.price_per_unit <= offer.price_per_unit;
      } else {
        // If I want to sell, match with buyers at or above my price
        return o.price_per_unit >= offer.price_per_unit;
      }
    })
    .sort((a, b) => {
      // Sort by best price
      if (offer.offer_type === 'buy') {
        return a.price_per_unit - b.price_per_unit; // Lowest first
      } else {
        return b.price_per_unit - a.price_per_unit; // Highest first
      }
    });
  }, [offer, allOffers]);
  
  const createTrade = useMutation({
    mutationFn: async (matchedOffer) => {
      // Use backend function for trade matching
      return base44.functions.invoke('matchTrades', {
        offer_id: matchedOffer.id,
        match_amount: matchedOffer.amount
      });
    },
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['trade-offers'] });
      queryClient.invalidateQueries({ queryKey: ['my-offers'] });
      
      const user = await base44.auth.me();
      const isSeller = offer.offer_type === 'sell';
      
      toast.success(t('marketplace.matchedOffers.toast.matchSuccessTitle'), {
        description: isSeller 
          ? t('marketplace.matchedOffers.toast.matchSuccessSellerDesc')
          : t('marketplace.matchedOffers.toast.matchSuccessBuyerDesc')
      });
      
      onOpenChange(false);
      
      // Navigate to trade details with the trade ID
      navigate(createPageUrl(`TradeDetails?id=${response.data.trade_id}`));
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || t('marketplace.matchedOffers.toast.matchError'));
    }
  });

  // Legacy implementation with proper navigation
  const createTradeLegacy = useMutation({
    mutationFn: async (matchedOffer) => {
      const user = await base44.auth.me();
      
      const tradeId = `0xT${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);
      
      // Determine trade amount (minimum of both offers' remaining amounts)
      const myRemaining = offer.amount - (offer.filled_amount || 0);
      const theirRemaining = matchedOffer.amount - (matchedOffer.filled_amount || 0);
      const tradeAmount = Math.min(myRemaining, theirRemaining);
      
      // Use the matched offer's price (better for us)
      const pricePerUnit = matchedOffer.price_per_unit;
      const fiatCurrency = matchedOffer.fiat_currency || 'ETB';
      
      // Determine roles based on offer types
      const sellerAddress = offer.offer_type === 'sell' ? offer.creator_address : matchedOffer.creator_address;
      const buyerAddress = offer.offer_type === 'buy' ? offer.creator_address : matchedOffer.creator_address;
      const sellerOffer = offer.offer_type === 'sell' ? offer : matchedOffer;
      
      // Get user profiles for fee discounts
      const allProfiles = await base44.entities.UserProfile.list();
      const sellerProfile = allProfiles.find(p => p.wallet_address === sellerAddress);
      const buyerProfile = allProfiles.find(p => p.wallet_address === buyerAddress);
      
      // Calculate fees with reputation discounts
      const baseMakerFee = 1; // 1%
      const baseTakerFee = 1.5; // 1.5%
      
      const makerDiscount = sellerProfile?.maker_fee_discount || 0;
      const takerDiscount = buyerProfile?.taker_fee_discount || 0;
      
      const makerFee = Math.max(0.1, baseMakerFee - makerDiscount); // Min 0.1%
      const takerFee = Math.max(0.1, baseTakerFee - takerDiscount); // Min 0.1%
      const totalFeePercentage = makerFee + takerFee;
      
      // Seller escrows: trade amount + both fees in tokens
      const escrowAmount = tradeAmount * (1 + totalFeePercentage / 100);
      
      // Buyer pays: trade amount + buyer's fee (taker fee) in fiat
      const buyerFiatAmount = tradeAmount * pricePerUnit;
      const buyerFeeInFiat = buyerFiatAmount * (takerFee / 100);
      const totalFiatAmount = buyerFiatAmount + buyerFeeInFiat;
      
      // Create the trade
      const trade = await base44.entities.Trade.create({
        trade_id: tradeId,
        seller_address: sellerAddress,
        buyer_address: buyerAddress,
        token_symbol: offer.token_symbol,
        amount: tradeAmount,
        chain: offer.chain,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        timeout_duration: 48,
        seller_signed: false,
        buyer_signed: false,
        is_insured: false,
        maker_fee: makerFee,
        taker_fee: takerFee,
        price_per_unit: pricePerUnit,
        fiat_currency: fiatCurrency,
        total_fiat_amount: totalFiatAmount,
        escrow_amount: escrowAmount,
        payment_methods: sellerOffer.payment_methods || [],
        terms: `Escrow created from marketplace matching. Rate: ${fiatCurrency} ${pricePerUnit} per ${offer.token_symbol}. Seller escrows ${escrowAmount.toFixed(2)} ${offer.token_symbol}. Buyer pays ${fiatCurrency} ${totalFiatAmount.toFixed(2)} as shown before confirmation.`
      });
      
      // Update both offers
      await base44.entities.TradeOffer.update(offer.id, {
        filled_amount: (offer.filled_amount || 0) + tradeAmount,
        status: (offer.filled_amount || 0) + tradeAmount >= offer.amount ? 'matched' : 'partially_filled',
        matched_trade_ids: [...(offer.matched_trade_ids || []), trade.id]
      });
      
      await base44.entities.TradeOffer.update(matchedOffer.id, {
        filled_amount: (matchedOffer.filled_amount || 0) + tradeAmount,
        status: (matchedOffer.filled_amount || 0) + tradeAmount >= matchedOffer.amount ? 'matched' : 'partially_filled',
        matched_trade_ids: [...(matchedOffer.matched_trade_ids || []), trade.id]
      });
      
      // Send notifications to both parties
      const tradeMatchNotif = NotificationTemplates.tradeMatched(trade.id, tradeAmount, trade.token_symbol);
      const offerMatchNotif = NotificationTemplates.offerMatched(offer.id, trade.id, tradeAmount, trade.token_symbol);

      await Promise.all([
        createNotification({
          userAddress: sellerAddress,
          ...tradeMatchNotif,
          metadata: { trade_id: trade.id, offer_id: offer.id, role: 'seller' }
        }),
        createNotification({
          userAddress: buyerAddress,
          ...tradeMatchNotif,
          metadata: { trade_id: trade.id, offer_id: matchedOffer.id, role: 'buyer' }
        }),
        createNotification({
          userAddress: offer.creator_address,
          ...offerMatchNotif,
          metadata: { trade_id: trade.id, offer_id: offer.id, matched_offer_id: matchedOffer.id }
        }),
        createNotification({
          userAddress: matchedOffer.creator_address,
          ...offerMatchNotif,
          metadata: { trade_id: trade.id, offer_id: matchedOffer.id, matched_offer_id: offer.id }
        })
      ]);
      
      return trade;
    },
    onSuccess: async (trade) => {
      queryClient.invalidateQueries({ queryKey: ['trade-offers'] });
      queryClient.invalidateQueries({ queryKey: ['my-offers'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      
      const user = await base44.auth.me();
      const isSeller = trade.seller_address === user.email;
      
      toast.success(t('marketplace.matchedOffers.toast.createdSuccessTitle'), {
        description: isSeller 
          ? t('marketplace.matchedOffers.toast.createdSuccessSellerNext')
          : t('marketplace.matchedOffers.toast.createdSuccessBuyerNext')
      });
      
      onOpenChange(false);
      navigate(createPageUrl(`TradeDetails?id=${trade.id}`));
    },
    onError: (error) => {
      toast.error(t('marketplace.matchedOffers.toast.createdFailed'));
      console.error(error);
    }
  });
  
  if (!offer) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Matched Offers</DialogTitle>
          <p className="text-slate-400 text-sm">
            {matches.length} potential {matches.length === 1 ? 'match' : 'matches'} found for your {offer.offer_type} order
          </p>
        </DialogHeader>
        
        {/* DisputeBond Warning */}
        <Alert className="bg-purple-500/10 border-purple-500/30">
          <Shield className="h-4 w-4 text-purple-400" />
          <AlertDescription className="text-purple-300 text-xs">
            <strong>DisputeBond:</strong> The Buyer DisputeBond locks when the Ad is taken. The Seller DisputeBond locks when the escrow is funded.
            DisputeBonds are refunded to the winner; the loser forfeits to Treasury.
          </AlertDescription>
        </Alert>
        
        {matches.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400">No matching offers found at this time.</p>
            <p className="text-slate-500 text-sm mt-2">Your offer will remain open for automatic matching.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <Card key={match.id} className="bg-slate-800/50 border-slate-700/50 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      match.offer_type === 'buy' 
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : 'bg-red-500/10 border border-red-500/30'
                    }`}>
                      {match.offer_type === 'buy' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {(match.amount - (match.filled_amount || 0)).toLocaleString()} {match.token_symbol}
                      </p>
                      <p className="text-xs text-slate-400">
                        @ {match.fiat_currency || 'USD'} {match.price_per_unit} per unit
                      </p>
                    </div>
                  </div>
                  
                  <ChainBadge chain={match.chain} />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Creator</p>
                    <WalletAddress address={match.creator_address} />
                    {profileMap[match.creator_address] && (
                      <div className="mt-1">
                        <ReputationBadge 
                          profile={profileMap[match.creator_address]} 
                          showScore={false} 
                          size="sm" 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-500">Total Value</p>
                    <p className="text-sm text-white font-semibold">
                      {match.fiat_currency || 'USD'} {(match.amount * match.price_per_unit).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {match.payment_methods && match.payment_methods.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-1">Payment Methods:</p>
                    <div className="flex flex-wrap gap-1">
                      {match.payment_methods.map((method, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                          {method.split(':')[0]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {match.notes && (
                  <p className="text-xs text-slate-400 mb-3 p-2 rounded bg-slate-900/50 border border-slate-700/50">
                    {match.notes}
                  </p>
                )}
                
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <p className="text-xs text-blue-300">
                      <Shield className="w-3 h-3 inline mr-1" />
                      {offer.offer_type === 'sell' 
                        ? 'Next Step: Fund escrow (amount + fees + Seller DisputeBond)'
                        : 'Next Step: Wait for seller funding, then confirm payment after fiat is sent'}
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => ensureWallet(() => createTrade.mutate(match))}
                    disabled={createTrade.isPending}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                    size="sm"
                  >
                    {createTrade.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {offer.offer_type === 'sell' ? 'Accept - Go to Escrow' : 'Accept - Go to Escrow'}
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
        {authModal}
      </DialogContent>
    </Dialog>
  );
}
