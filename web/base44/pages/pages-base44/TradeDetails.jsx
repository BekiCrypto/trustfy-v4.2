import { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
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
import { Link } from "react-router-dom";
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

export default function TradeDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const tradeId = urlParams.get('id');
  const { getBondCredits } = useWallet();
  
  const queryClient = useQueryClient();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [counterpartyToRate, setCounterpartyToRate] = useState(null);
  const [bondAmount, setBondAmount] = useState(null);
  const [bondCredits, setBondCredits] = useState(null);
  const [escrowStatus, setEscrowStatus] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
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
  
  const { data: profiles = [] } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    staleTime: 60000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
  
  const sellerProfile = profiles.find(p => p.wallet_address === trade?.seller_address);
  const buyerProfile = profiles.find(p => p.wallet_address === trade?.buyer_address);
  
  const { data: existingReview } = useQuery({
    queryKey: ['my-review', tradeId],
    queryFn: async () => {
      const user = await base44.auth.me();
      const reviews = await base44.entities.TradeReview.filter({ 
        trade_id: tradeId,
        reviewer_address: user.email
      });
      return reviews[0];
    },
    enabled: !!tradeId && trade?.status === 'completed'
  });
  
  const { data: dispute } = useQuery({
    queryKey: ['dispute', tradeId],
    queryFn: async () => {
      const disputes = await base44.entities.Dispute.filter({ trade_id: tradeId });
      return disputes[0];
    },
    enabled: !!tradeId && trade?.status === 'disputed'
  });
  
  // Fetch current user
  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => null);
  }, []);
  
  // Check if user can rate (trade completed and no review yet)
  useEffect(() => {
    if (trade?.status === 'completed' && !existingReview) {
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
  }, [trade?.status, existingReview, sellerProfile, buyerProfile]);
  
  const updateTrade = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Trade.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade', tradeId] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    }
  });
  

  
  const requestAction = (action) => {
    const confirmations = {
      fund: {
        title: 'Fund Escrow?',
        description: `You are about to escrow ${trade.escrow_amount || trade.amount} ${trade.token_symbol}. These funds will be locked until the trade is completed or disputed.`,
        variant: 'warning'
      },
      release: {
        title: 'Release Funds?',
        description: `You are about to release ${trade.amount} ${trade.token_symbol} to the buyer. This action cannot be undone.`,
        variant: 'warning'
      },
      dispute: {
        title: 'Open Dispute?',
        description: 'Opening a dispute will lock the funds and escalate to arbitration. A dispute fee may apply. Are you sure you want to proceed?',
        variant: 'destructive'
      },
      cancel: {
        title: 'Cancel Trade?',
        description: 'Are you sure you want to cancel this trade? This action cannot be undone.',
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
          initiator_address: '0x...YourWallet',
          reason: 'Dispute initiated from trade',
          status: 'pending',
          escalation_level: 1
        });
        notifications.push({
          userAddress: trade.seller_address === '0x...YourWallet' ? trade.buyer_address : trade.seller_address,
          ...NotificationTemplates.disputeOpened(dispute.id, trade.id, '0x...YourWallet'),
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

    toast.success(`Trade ${action}ed successfully`);
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
          <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
          <p className="text-slate-400 mb-6">The order you're looking for doesn't exist.</p>
          <Link to={createPageUrl('Orders')}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const timeRemaining = trade.expires_at 
    ? Math.max(0, new Date(trade.expires_at) - new Date()) / (1000 * 60 * 60)
    : 0;
  
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
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white">Order Details</h1>
              <StatusBadge status={trade.status} />
              <ChainBadge chain={trade.chain} />
              {trade.is_insured && (
                <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3" />
                  Insured
                </div>
              )}
            </div>
            <p className="text-slate-500 font-mono text-sm mt-1">{trade.trade_id}</p>
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
                    Order Summary
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <p className="text-sm text-emerald-400 mb-1">Trade Amount</p>
                      <p className="text-2xl font-bold text-white">
                        {trade.amount?.toLocaleString()} {trade.token_symbol}
                      </p>
                    </div>
                    {trade.total_fiat_amount && (
                      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                        <p className="text-sm text-blue-400 mb-1">Buyer Pays (in {trade.fiat_currency || 'Fiat'})</p>
                        <p className="text-2xl font-bold text-white">
                          {trade.fiat_currency || 'ETB'} {trade.total_fiat_amount?.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Includes {trade.taker_fee}% buyer fee
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
                      <span className="text-sm font-medium">Seller</span>
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
                      <span className="text-sm font-medium">Buyer</span>
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
                      <p className="text-sm text-amber-400 mb-2">Seller Escrow Amount</p>
                      <p className="text-xl font-bold text-white">
                        {trade.escrow_amount?.toFixed(2)} {trade.token_symbol}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Includes trade amount + {trade.maker_fee}% maker fee + {trade.taker_fee}% taker fee
                      </p>
                    </div>
                  )}
                  
                  {trade.payment_methods && trade.payment_methods.length > 0 && (
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <p className="text-sm text-slate-400 mb-2">Payment Methods</p>
                      <div className="flex flex-wrap gap-2">
                        {trade.payment_methods.map((method, idx) => (
                          <div key={idx} className="text-sm text-white bg-slate-700/50 px-3 py-1 rounded">
                            {method}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Rate</p>
                      <p className="text-white font-semibold">
                        {trade.fiat_currency || 'ETB'} {trade.price_per_unit || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Maker Fee</p>
                      <p className="text-white font-semibold">{trade.maker_fee}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Taker Fee</p>
                      <p className="text-white font-semibold">{trade.taker_fee}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Expires</p>
                      <p className="text-white font-semibold">
                        {trade.expires_at ? format(new Date(trade.expires_at), "MMM d, HH:mm") : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Terms */}
                {trade.terms && (
                  <div className="mt-6 pt-6 border-t border-slate-700/50">
                    <p className="text-slate-500 text-sm mb-2">Trade Terms</p>
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
                currentUser="0x...YourWallet"
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
          />
          
          {/* Payment Instructions for Buyer */}
          {currentUser?.email === trade.buyer_address && trade.status === 'funded' && (
            <PaymentInstructionsCard 
              trade={trade}
              onPaymentSubmit={() => setShowPaymentModal(true)}
            />
          )}
          
          {/* Escrow Summary */}
          <EscrowSummaryDrawer trade={trade} bondAmount={bondAmount} escrowStatus={escrowStatus} />
          
          {/* Status Explainer */}
          <TradeStatusExplainer status={trade.status} />
          
          {/* Bond Breakdown */}
          {currentUser && (trade.status === 'pending' || trade.status === 'funded') && (
            <BondBreakdown 
              trade={trade} 
              bondAmount={bondAmount}
              bondCredits={bondCredits}
              userRole={currentUser.email === trade.seller_address ? 'seller' : 'buyer'}
              status={trade.status}
            />
          )}
          
          {/* Bond Account */}
          {currentUser && trade.status !== 'cancelled' && (
            <BondAccount chain={trade.chain} tokens={[trade.token_symbol]} />
          )}
          
          {/* Dispute Panel */}
          {trade.status === 'disputed' && dispute && (
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
            {trade.status === 'pending' && timeRemaining > 0 && (
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-400 font-medium">Time Remaining</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {Math.floor(timeRemaining)}h {Math.floor((timeRemaining % 1) * 60)}m
                </p>
              </Card>
            )}
            
            {/* Actions */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              
              <div className="space-y-3">
                {trade.status === 'pending' && (
                  <>
                    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 mb-3">
                      <p className="text-xs text-slate-400 mb-1">Seller Action Required:</p>
                      <p className="text-sm text-white font-semibold">
                        Escrow {trade.escrow_amount?.toFixed(2) || trade.amount} {trade.token_symbol}
                      </p>
                    </div>
                    <Button
                      onClick={() => requestAction('fund')}
                      disabled={updateTrade.isPending}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Fund Escrow
                    </Button>
                    <Button
                      onClick={() => requestAction('cancel')}
                      disabled={updateTrade.isPending}
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Trade
                    </Button>
                  </>
                )}
                
                {trade.status === 'funded' && (
                  <>
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 mb-3">
                      <p className="text-xs text-blue-400 mb-1">Buyer Action Required:</p>
                      <p className="text-sm text-white font-semibold mb-2">
                        Pay {trade.fiat_currency || 'ETB'} {(() => {
                          if (trade.total_fiat_amount) {
                            return Number(trade.total_fiat_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          }
                          const baseFiatAmount = Number(trade.amount || 0) * Number(trade.price_per_unit || 0);
                          const buyerFee = baseFiatAmount * (Number(trade.taker_fee || 0) / 100);
                          const totalAmount = baseFiatAmount + buyerFee;
                          return totalAmount > 0 ? totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A';
                        })()}
                      </p>
                      {trade.payment_methods && trade.payment_methods.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-slate-400 mb-1">To payment method:</p>
                          {trade.payment_methods.map((method, idx) => (
                            <p key={idx} className="text-xs text-white bg-slate-800/50 px-2 py-1 rounded mt-1">
                              {method}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => setShowPaymentModal(true)}
                      disabled={updateTrade.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      I've Paid - Submit Proof
                    </Button>
                  </>
                )}
                
                {trade.status === 'in_progress' && (
                  <>
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 mb-3">
                      <div className="flex items-center gap-2 text-purple-400 text-xs mb-1">
                        <Shield className="w-4 h-4" />
                        <span className="font-semibold">Both Bonds Secured</span>
                      </div>
                      <p className="text-white text-sm">
                        Seller + Buyer bonds are locked. Only arbitrator can resolve disputes now.
                      </p>
                    </div>
                    
                    {currentUser?.email === trade.seller_address && (
                      <Button
                        onClick={() => requestAction('release')}
                        disabled={updateTrade.isPending}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Release Funds (Refund Bonds)
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => requestAction('dispute')}
                      disabled={updateTrade.isPending}
                      variant="outline"
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Open Dispute
                    </Button>
                    
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <p className="text-amber-300 text-xs">
                        <strong>⚠️ Warning:</strong> Losing a dispute forfeits your bond to winner.
                      </p>
                    </div>
                  </>
                )}
                
                {trade.status === 'completed' && (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                    <p className="text-emerald-400 font-medium">Trade Completed</p>
                    <p className="text-slate-500 text-sm mt-1">Funds have been released</p>
                    {!existingReview && counterpartyToRate && (
                      <Button 
                        onClick={() => setShowRatingModal(true)}
                        className="w-full mt-4 bg-amber-600 hover:bg-amber-700"
                      >
                        Rate Trading Partner
                      </Button>
                    )}
                  </div>
                )}
                
                {trade.status === 'disputed' && (
                  <div className="text-center py-4">
                    <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                    <p className="text-amber-400 font-medium">Under Dispute</p>
                    <p className="text-slate-500 text-sm mt-1">Awaiting resolution</p>
                    <Link to={createPageUrl('Disputes')}>
                      <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700">
                        View Dispute
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Transaction Info */}
            {trade.tx_hash && (
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Transaction</h3>
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
        onConfirm={() => handleAction('confirm')}
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
        confirmText="Proceed"
        variant={confirmAction?.variant}
      />
      
      <TradeRatingModal
        open={showRatingModal}
        onOpenChange={setShowRatingModal}
        trade={trade}
        counterpartyProfile={counterpartyToRate}
      />
    </div>
  );
}
