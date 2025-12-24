import { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { reviewsApi } from "@/api/reviews";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Wallet,
  User,
  ArrowLeftRight
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import StatusBadge from "../components/common/StatusBadge";
import ChainBadge from "../components/common/ChainBadge";
import WalletAddress from "../components/common/WalletAddress";
import ReputationBadge from "../components/common/ReputationBadge";
import { createNotification, NotificationTemplates } from "../components/notifications/notificationHelpers";
import TradeChat from "../components/trade/TradeChat";
import PaymentConfirmationModal from "../components/trade/PaymentConfirmationModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import TradeRatingModal from "../components/trade/TradeRatingModal";
import EscrowManager from "../components/trade/EscrowManager";
import EscrowSummaryDrawer from "../components/trade/EscrowSummaryDrawer";
import BondBreakdown from "../components/trade/BondBreakdown";
import BondAccount from "../components/trade/BondAccount";
import DisputeResolutionPanel from "../components/trade/DisputeResolutionPanel";
import TradeStatusExplainer from "../components/trade/TradeStatusExplainer";
import TradeFlowManager from "../components/trade/TradeFlowManager";
import PaymentInstructionsCard from "../components/trade/PaymentInstructionsCard";
import { useWallet } from "../components/web3/WalletContext";
import { useWalletGuard } from "@/components/web3/useWalletGuard";
import { useTranslation } from '@/hooks/useTranslation';

export default function TradeDetails() {
  const { t } = useTranslation();
  const { escrowId } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const tradeId = urlParams.get('id') || escrowId;
  const { getBondCredits, getTokenConfig } = useWallet();
  const { ensureWallet, authModal } = useWalletGuard();
  
  const queryClient = useQueryClient();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [counterpartyToRate, setCounterpartyToRate] = useState(null);
  const [bondAmount, setBondAmount] = useState(null);
  const [bondCredits, setBondCredits] = useState(null);
  const [escrowStatus, setEscrowStatus] = useState(null);
  const [tokenConfig, setTokenConfig] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  const mapChainStatus = (status) => {
    switch (status) {
      case 1:
        return 'pending';
      case 2:
        return 'funded';
      case 3:
        return 'in_progress';
      case 4:
        return 'disputed';
      case 5:
        return 'completed';
      case 6:
        return 'cancelled';
      default:
        return trade?.status;
    }
  };

  const { data: trade, isLoading } = useQuery({
    queryKey: ['trade', tradeId],
    queryFn: async () => {
      const trades = await base44.entities.Trade.filter({ id: tradeId });
      return trades[0];
    },
    enabled: !!tradeId,
    refetchInterval: 30000,
    staleTime: 20000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
  
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', tradeId],
    queryFn: () => base44.entities.ChatMessage.filter({ trade_id: tradeId }, '-created_date'),
    enabled: !!tradeId,
    refetchInterval: 15000,
    staleTime: 10000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
  
  const { data: sellerStats } = useQuery({
    queryKey: ['reputation', trade?.seller_address],
    queryFn: () => reviewsApi.getStats(trade?.seller_address),
    enabled: !!trade?.seller_address
  });

  const { data: buyerStats } = useQuery({
    queryKey: ['reputation', trade?.buyer_address],
    queryFn: () => reviewsApi.getStats(trade?.buyer_address),
    enabled: !!trade?.buyer_address
  });

  const sellerProfile = sellerStats ? {
    wallet_address: trade?.seller_address,
    reputation_score: sellerStats.reputationScore,
    total_trades: sellerStats.successfulTrades
  } : null;

  const buyerProfile = buyerStats ? {
    wallet_address: trade?.buyer_address,
    reputation_score: buyerStats.reputationScore,
    total_trades: buyerStats.successfulTrades
  } : null;

  const effectiveStatus = escrowStatus?.status !== undefined
    ? mapChainStatus(escrowStatus.status)
    : trade?.status;

  const { data: existingReview } = useQuery({
    queryKey: ['my-review', trade?.trade_id],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!trade?.trade_id) return null;
      
      const reviews = await reviewsApi.listReviews({ 
        tradeId: trade.trade_id,
        reviewer: user.email
      });
      return reviews[0];
    },
    enabled: !!trade?.trade_id && effectiveStatus === 'completed'
  });
  
  const { data: dispute } = useQuery({
    queryKey: ['dispute', tradeId],
    queryFn: async () => {
      const disputes = await base44.entities.Dispute.filter({ trade_id: tradeId });
      return disputes[0];
    },
    enabled: !!tradeId && effectiveStatus === 'disputed'
  });
  
  // Fetch current user
  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => null);
  }, []);

  useEffect(() => {
    const loadConfig = async () => {
      if (!trade?.chain || !trade?.token_symbol) return;
      try {
        const cfg = await getTokenConfig(trade.chain, trade.token_symbol);
        setTokenConfig(cfg);
      } catch (error) {
        console.warn('Token config unavailable:', error?.message);
      }
    };
    loadConfig();
  }, [trade?.chain, trade?.token_symbol, getTokenConfig]);
  
  // Check if user can rate (trade completed and no review yet)
  useEffect(() => {
    if (effectiveStatus === 'completed' && !existingReview) {
      const checkAndShowRating = async () => {
        const user = await base44.auth.me();
        const isUserSeller = trade.seller_address === user.email;
        const counterparty = isUserSeller ? buyerProfile : sellerProfile;
        
        if (counterparty) {
          setCounterpartyToRate(counterparty);
          // Show rating modal after a delay
          setTimeout(() => setShowRatingModal(true), 2000);
        }
      };
      checkAndShowRating();
    }
  }, [effectiveStatus, existingReview, sellerProfile, buyerProfile]);
  
  const updateTrade = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Trade.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade', tradeId] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    }
  });
  

  
  const requestAction = (action) => {
    if (action === 'dispute') {
      if (effectiveStatus !== 'in_progress') {
        toast.error('Disputes are only allowed after PAYMENT_CONFIRMED.');
        return;
      }
      if (dispute) {
        toast.error('A dispute already exists for this escrow.');
        return;
      }
      if (currentUser?.email !== trade.seller_address && currentUser?.email !== trade.buyer_address) {
        toast.error('Only escrow participants can open a dispute.');
        return;
      }
    }
    const confirmations = {
      fund: {
        title: t('tradeDetails.confirmations.fund.title'),
        description: t('tradeDetails.confirmations.fund.description', {
          amount: trade.escrow_amount || trade.amount,
          token: trade.token_symbol
        }),
        variant: 'warning'
      },
      release: {
        title: t('tradeDetails.confirmations.release.title'),
        description: t('tradeDetails.confirmations.release.description', {
          amount: trade.amount,
          token: trade.token_symbol
        }) + ' Release is final: buyer receives crypto, fees go to treasury, and bonds are refunded.',
        variant: 'warning'
      },
      dispute: {
        title: t('tradeDetails.confirmations.dispute.title'),
        description: `${t('tradeDetails.confirmations.dispute.description')} Disputes are allowed only after PAYMENT_CONFIRMED and only once. The losing party forfeits their DisputeBond to the Treasury.`,
        variant: 'destructive'
      },
      cancel: {
        title: t('tradeDetails.confirmations.cancel.title'),
        description: t('tradeDetails.confirmations.cancel.description'),
        variant: 'destructive'
      }
    };
    
    setConfirmAction({ action, ...confirmations[action] });
  };

  const handleAction = async (action) => {
    let newStatus = trade.status;
    let newData = {};
    let notifications = [];

    switch (action) {
      case 'fund':
        newStatus = 'funded';
        newData = { seller_signed: true };
        notifications.push({
          userAddress: trade.buyer_address,
          ...NotificationTemplates.tradeFunded(trade.id, trade.escrow_amount || trade.amount, trade.token_symbol),
          metadata: { trade_id: trade.id, action: 'escrow_funded' }
        });
        break;

      case 'confirm':
        newStatus = 'in_progress';
        newData = { buyer_signed: true };
        notifications.push({
          userAddress: trade.seller_address,
          ...NotificationTemplates.paymentConfirmed(trade.id),
          metadata: { trade_id: trade.id, action: 'payment_confirmed' }
        });
        notifications.push({
          userAddress: trade.buyer_address,
          ...NotificationTemplates.tradeInProgress(trade.id),
          metadata: { trade_id: trade.id, action: 'awaiting_release' }
        });
        break;

      case 'release':
        newStatus = 'completed';
        notifications.push({
          userAddress: trade.buyer_address,
          ...NotificationTemplates.cryptoReleased(trade.id, trade.amount, trade.token_symbol),
          metadata: { trade_id: trade.id, action: 'crypto_released' }
        });
        notifications.push({
          userAddress: trade.buyer_address,
          ...NotificationTemplates.tradeCompleted(trade.id, trade.amount, trade.token_symbol),
          metadata: { trade_id: trade.id, action: 'completed' }
        });
        notifications.push({
          userAddress: trade.seller_address,
          ...NotificationTemplates.tradeCompleted(trade.id, trade.amount, trade.token_symbol),
          metadata: { trade_id: trade.id, action: 'completed' }
        });
        break;

      case 'dispute': {
        newStatus = 'disputed';
        // Create dispute record first, then notify
        const dispute = await base44.entities.Dispute.create({
          trade_id: trade.id,
          initiator_address: currentUser?.email,
          reason: 'Dispute initiated from escrow',
          status: 'pending',
          escalation_level: 1
        });
        notifications.push({
          userAddress: trade.seller_address === currentUser?.email ? trade.buyer_address : trade.seller_address,
          ...NotificationTemplates.disputeOpened(dispute.id, trade.id, currentUser?.email || '0x'),
          metadata: { trade_id: trade.id, dispute_id: dispute.id }
        });
        break;
      }

      case 'cancel': {
        newStatus = 'cancelled';
        const otherParty = trade.seller_address === '0x...YourWallet' ? trade.buyer_address : trade.seller_address;
        notifications.push({
          userAddress: otherParty,
          ...NotificationTemplates.tradeCancelled(trade.id),
          metadata: { trade_id: trade.id, action: 'cancelled' }
        });
        break;
      }
    }

    // Update trade status
    await updateTrade.mutateAsync({ 
      id: tradeId, 
      data: { status: newStatus, ...newData }
    });

    // Send all notifications
    await Promise.all(notifications.map(notif => createNotification(notif)));

    const actionSuccessLabels = {
      fund: t('tradeDetails.actionSuccess.fund'),
      confirm: t('tradeDetails.actionSuccess.confirm'),
      release: t('tradeDetails.actionSuccess.release'),
      dispute: t('tradeDetails.actionSuccess.dispute'),
      cancel: t('tradeDetails.actionSuccess.cancel')
    };
    toast.success(actionSuccessLabels[action] || t('common.success'));
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }
  
  if (!trade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('tradeDetails.orderNotFound')}</h2>
          <p className="text-slate-400 mb-6">{t('tradeDetails.orderDoesntExist')}</p>
          <Link to={createPageUrl('Orders')}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('tradeDetails.backToOrders')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const nowSeconds = Math.floor(Date.now() / 1000);
  const sellerFundDeadline =
    tokenConfig?.sellerFundWindow && escrowStatus?.takenAt
      ? escrowStatus.takenAt + tokenConfig.sellerFundWindow
      : null;
  const buyerConfirmDeadline =
    tokenConfig?.buyerConfirmWindow && escrowStatus?.fundedAt
      ? escrowStatus.fundedAt + tokenConfig.buyerConfirmWindow
      : null;
  const sellerReleaseDeadline =
    tokenConfig?.sellerReleaseWindow && escrowStatus?.paymentConfirmedAt
      ? escrowStatus.paymentConfirmedAt + tokenConfig.sellerReleaseWindow
      : null;

  const getRemainingSeconds = (deadline) =>
    deadline ? Math.max(0, deadline - nowSeconds) : null;

  const sellerFundRemaining = getRemainingSeconds(sellerFundDeadline);
  const buyerConfirmRemaining = getRemainingSeconds(buyerConfirmDeadline);
  const sellerReleaseRemaining = getRemainingSeconds(sellerReleaseDeadline);

  const formatCountdown = (seconds) => {
    if (seconds === null) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Link to={createPageUrl('Orders')}>
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{t('tradeDetails.orderDetails')}</h1>
              <StatusBadge status={effectiveStatus} />
              <ChainBadge chain={trade.chain} />
              {trade.is_insured && (
                <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3" />
                  {t('myAds.insurance.insured')}
                </div>
              )}
            </div>
            <p className="text-slate-500 font-mono text-sm mt-1">
              {t('tradeDetails.escrowIdLabel')}: {trade.trade_id}
            </p>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trade Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-blue-400" />
                    {t('tradeDetails.orderSummary')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <p className="text-sm text-emerald-400 mb-1">{t('tradeDetails.escrowAmount')}</p>
                      <p className="text-2xl font-bold text-white">
                        {trade.amount?.toLocaleString()} {trade.token_symbol}
                      </p>
                    </div>
                    {trade.total_fiat_amount && (
                      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                        <p className="text-sm text-blue-400 mb-1">
                          {t('tradeDetails.buyerPays')} ({trade.fiat_currency || t('tradeDetails.fiatLabel')})
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {trade.fiat_currency || 'ETB'} {trade.total_fiat_amount?.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {t('trade.paymentInstructions.amountNote')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Seller */}
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('tradeDetails.seller')}</span>
                      {trade.seller_signed && (
                        <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
                      )}
                    </div>
                    <WalletAddress address={trade.seller_address} truncate={false} />
                    {sellerProfile && (
                      <div className="mt-2">
                        <ReputationBadge profile={sellerProfile} showScore={false} showStats size="sm" />
                      </div>
                    )}
                  </div>
                  
                  {/* Buyer */}
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('tradeDetails.buyer')}</span>
                      {trade.buyer_signed && (
                        <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
                      )}
                    </div>
                    <WalletAddress address={trade.buyer_address} truncate={false} />
                    {buyerProfile && (
                      <div className="mt-2">
                        <ReputationBadge profile={buyerProfile} showScore={false} showStats size="sm" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Escrow & Payment Details */}
                <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-4">
                  {trade.escrow_amount && (
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <p className="text-sm text-amber-400 mb-2">{t('tradeDetails.escrowAmount')}</p>
                      <p className="text-xl font-bold text-white">
                        {trade.escrow_amount?.toFixed(2)} {trade.token_symbol}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {t('tradeDetails.includesAmount')}
                      </p>
                    </div>
                  )}
                  
                  {trade.payment_methods && trade.payment_methods.length > 0 && (
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <p className="text-sm text-slate-400 mb-2">{t('tradeDetails.paymentMethods')}</p>
                      <div className="flex flex-wrap gap-2">
                        {trade.payment_methods.map((method, idx) => {
                          const label = (method || '').split(':')[0];
                          return (
                            <div key={idx} className="text-sm text-white bg-slate-700/50 px-3 py-1 rounded">
                              {label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">{t('tradeDetails.rate')}</p>
                      <p className="text-white font-semibold">
                        {trade.fiat_currency || 'ETB'} {trade.price_per_unit || t('trade.paymentConfirmation.notAvailable')}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">{t('tradeDetails.expires')}</p>
                      <p className="text-white font-semibold">
                        {trade.expires_at ? format(new Date(trade.expires_at), "MMM d, HH:mm") : t('trade.paymentConfirmation.notAvailable')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Terms */}
                {trade.terms && (
                  <div className="mt-6 pt-6 border-t border-slate-700/50">
                    <p className="text-slate-500 text-sm mb-2">{t('tradeDetails.escrowTerms')}</p>
                    <p className="text-slate-300">{trade.terms}</p>
                  </div>
                )}
              </Card>
            </motion.div>
            
            {/* Chat */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <TradeChat 
                trade={trade} 
                messages={messages} 
                currentUser={currentUser?.email || '0x...YourWallet'}
              />
            </motion.div>
          </div>
          
          {/* Actions Sidebar */}
          <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
          >
          {/* Trade Flow Manager */}
          <TradeFlowManager 
            trade={trade} 
            currentUser={currentUser}
            bondAmount={bondAmount}
            escrowStatus={escrowStatus}
            effectiveStatus={effectiveStatus}
          />
          
          {/* Payment Instructions for Buyer */}
          {currentUser?.email === trade.buyer_address && effectiveStatus === 'funded' && (
            <PaymentInstructionsCard 
              trade={trade}
              onPaymentSubmit={() => ensureWallet(() => setShowPaymentModal(true))}
            />
          )}
          
          {/* Escrow Summary */}
          <EscrowSummaryDrawer trade={trade} bondAmount={bondAmount} escrowStatus={escrowStatus} effectiveStatus={effectiveStatus} />
          
          {/* Status Explainer */}
          <TradeStatusExplainer status={effectiveStatus} />
          
          {/* Bond Breakdown */}
          {currentUser && (effectiveStatus === 'pending' || effectiveStatus === 'funded') && (
            <BondBreakdown 
              trade={trade} 
              bondAmount={bondAmount}
              bondCredits={bondCredits}
              userRole={currentUser.email === trade.seller_address ? 'seller' : 'buyer'}
              status={effectiveStatus}
            />
          )}
          
          {/* Bond Account */}
          {currentUser && effectiveStatus !== 'cancelled' && (
            <BondAccount chain={trade.chain} tokens={[trade.token_symbol]} />
          )}
          
          {/* Dispute Panel */}
          {effectiveStatus === 'disputed' && dispute && (
            <DisputeResolutionPanel dispute={dispute} trade={trade} bondAmount={bondAmount} />
          )}
          
          {/* Escrow Manager */}
          <EscrowManager 
            trade={trade} 
            onUpdate={() => queryClient.invalidateQueries({ queryKey: ['trade', tradeId] })}
            onBondAmountLoaded={(amt) => {
              setBondAmount(amt);
              // Also fetch bond credits when we know the token
              if (currentUser && trade.token_symbol && getBondCredits) {
                getBondCredits(trade.chain, trade.token_symbol, currentUser.email)
                  .then(setBondCredits)
                  .catch(console.error);
              }
            }}
            onEscrowStatusLoaded={setEscrowStatus}
          />

            {/* Time Remaining */}
            {effectiveStatus === 'pending' && sellerFundRemaining !== null && (
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-400 font-medium">{t('tradeDetails.timeRemaining')}</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatCountdown(sellerFundRemaining) || '--'}
                </p>
                {sellerFundRemaining === 0 && (
                  <p className="text-xs text-amber-300 mt-2">
                    Seller funding window has expired. Funding is no longer available.
                    AdBond forfeiture may apply and the Buyer DisputeBond is refundable.
                  </p>
                )}
              </Card>
            )}
            {effectiveStatus === 'funded' && buyerConfirmRemaining !== null && (
              <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/30 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Buyer confirmation window</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatCountdown(buyerConfirmRemaining) || '--'}
                </p>
                {buyerConfirmRemaining === 0 && (
                  <p className="text-xs text-blue-300 mt-2">
                    Buyer confirmation window has expired. Confirmation is no longer available.
                    Missing the deadline may forfeit the Buyer DisputeBond to the Treasury.
                  </p>
                )}
              </Card>
            )}
            {effectiveStatus === 'in_progress' && sellerReleaseRemaining !== null && (
              <Card className="bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border-purple-500/30 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400 font-medium">Seller release window</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatCountdown(sellerReleaseRemaining) || '--'}
                </p>
                {sellerReleaseRemaining === 0 && (
                  <p className="text-xs text-purple-300 mt-2">
                    Seller release window has expired. Release is no longer available.
                    Buyer may open a dispute; the losing party forfeits their DisputeBond.
                  </p>
                )}
              </Card>
            )}
            
            {/* Actions */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{t('tradeDetails.actions')}</h3>
              
              <div className="space-y-3">
                {effectiveStatus === 'pending' && (
                  <>
                    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 mb-3">
                      <p className="text-xs text-slate-400 mb-1">{t('tradeDetails.sellerActionRequired')}:</p>
                      <p className="text-sm text-white font-semibold">
                        {t('tradeDetails.escrowAmountLine', {
                          amount: trade.escrow_amount?.toFixed(2) || trade.amount,
                          token: trade.token_symbol
                        })}
                      </p>
                    </div>
                    <Button
                      onClick={() => ensureWallet(() => requestAction('fund'))}
                      disabled={updateTrade.isPending || sellerFundRemaining === 0}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      {t('tradeDetails.fundEscrow')}
                    </Button>
                    <Button
                      onClick={() => ensureWallet(() => requestAction('cancel'))}
                      disabled={updateTrade.isPending}
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {t('tradeDetails.cancelEscrow')}
                    </Button>
                  </>
                )}
                
                {effectiveStatus === 'funded' && (
                  <>
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 mb-3">
                      <p className="text-xs text-blue-400 mb-1">{t('tradeDetails.buyerActionRequired')}:</p>
                      <p className="text-sm text-white font-semibold mb-2">
                        {t('tradeDetails.payAmount', {
                          currency: trade.fiat_currency || 'ETB',
                          amount: (() => {
                          if (trade.total_fiat_amount) {
                            return Number(trade.total_fiat_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          }
                          const baseFiatAmount = Number(trade.amount || 0) * Number(trade.price_per_unit || 0);
                          return baseFiatAmount > 0
                            ? baseFiatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : t('trade.paymentConfirmation.notAvailable');
                        })()
                        })}
                      </p>
                      {trade.payment_methods && trade.payment_methods.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-slate-400 mb-1">{t('tradeDetails.payTo')}:</p>
                          {trade.payment_methods.map((method, idx) => {
                            const parts = (method || '').split(':');
                            const label = parts[0];
                            const details = parts[1]?.trim();
                            const canViewDetails = currentUser?.email === trade.buyer_address;
                            return (
                              <p key={idx} className="text-xs text-white bg-slate-800/50 px-2 py-1 rounded mt-1">
                                {canViewDetails ? (details ? `${label}: ${details}` : label) : label}
                              </p>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {buyerConfirmRemaining === 0 && (
                      <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 mb-3">
                        <p className="text-xs text-red-300">
                          Confirmation window expired. Missing the deadline may forfeit the buyer DisputeBond.
                        </p>
                      </div>
                    )}
                    <Button
                      onClick={() => ensureWallet(() => setShowPaymentModal(true))}
                      disabled={updateTrade.isPending || buyerConfirmRemaining === 0}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('tradeDetails.submitProof')}
                    </Button>
                  </>
                )}
                
                {effectiveStatus === 'in_progress' && (
                  <>
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 mb-3">
                      <div className="flex items-center gap-2 text-purple-400 text-xs mb-1">
                        <Shield className="w-4 h-4" />
                        <span className="font-semibold">{t('tradeDetails.bondsSecuredTitle')}</span>
                      </div>
                      <p className="text-white text-sm">
                        {t('tradeDetails.bondsSecuredDesc')}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 mb-3">
                      <p className="text-xs text-emerald-300 mb-1">Release is irreversible</p>
                      <p className="text-sm text-white">
                        On release, the buyer receives crypto, platform fees go to the treasury, and both bonds are refunded.
                      </p>
                    </div>
                    
                    {currentUser?.email === trade.seller_address && (
                      <Button
                        onClick={() => ensureWallet(() => requestAction('release'))}
                        disabled={updateTrade.isPending || sellerReleaseRemaining === 0}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t('tradeDetails.releaseFundsWithRefund')}
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => ensureWallet(() => requestAction('dispute'))}
                      disabled={
                        updateTrade.isPending ||
                        currentUser?.email !== trade.seller_address && currentUser?.email !== trade.buyer_address
                      }
                      variant="outline"
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      {t('tradeDetails.openDispute')}
                    </Button>
                    
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <p className="text-amber-300 text-xs">
                        {t('tradeDetails.bondForfeitWarning')} The losing party forfeits their DisputeBond to the Treasury.
                      </p>
                    </div>
                  </>
                )}
                
                {effectiveStatus === 'completed' && (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                    <p className="text-emerald-400 font-medium">{t('tradeDetails.escrowCompleted')}</p>
                    <p className="text-slate-500 text-sm mt-1">{t('tradeDetails.fundsReleased')}</p>
                    {!existingReview && counterpartyToRate && (
                      <Button
                        onClick={() => ensureWallet(() => setShowRatingModal(true))}
                        className="w-full mt-4 bg-amber-600 hover:bg-amber-700"
                      >
                        {t('tradeDetails.rateCounterparty')}
                      </Button>
                    )}
                  </div>
                )}
                
                {effectiveStatus === 'disputed' && (
                  <div className="text-center py-4">
                    <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                    <p className="text-amber-400 font-medium">{t('tradeDetails.underDispute')}</p>
                    <p className="text-slate-500 text-sm mt-1">{t('tradeDetails.awaitingResolution')}</p>
                    <Link to={createPageUrl('Disputes')}>
                      <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700">
                        {t('tradeDetails.viewDispute')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Transaction Info */}
            {trade.tx_hash && (
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{t('tradeDetails.transaction')}</h3>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-slate-400 truncate">{trade.tx_hash}</p>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      <PaymentConfirmationModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        trade={trade}
        effectiveStatus={effectiveStatus}
        buyerConfirmRemaining={buyerConfirmRemaining}
        onConfirm={() => ensureWallet(() => handleAction('confirm'))}
      />
      
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        onConfirm={() => {
          handleAction(confirmAction.action);
          setConfirmAction(null);
        }}
        title={confirmAction?.title}
        description={confirmAction?.description}
        confirmText={t('common.confirm')}
        variant={confirmAction?.variant}
      />
      
      <TradeRatingModal
        open={showRatingModal}
        onOpenChange={setShowRatingModal}
        trade={trade}
        counterpartyProfile={counterpartyToRate}
      />
      {authModal}
    </div>
  );
}
