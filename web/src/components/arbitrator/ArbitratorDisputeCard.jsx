import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ChevronDown,
  ChevronUp,
  MessageSquare,
  User,
  ArrowLeftRight,
  CheckCircle,
  XCircle,
  Scale,
  FileText,
  Loader2,
  AlertCircle,
  Clock,
  Eye,
  ShieldCheck,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import WalletAddress from "../common/WalletAddress";
import StatusBadge from "../common/StatusBadge";
import ChainBadge from "../common/ChainBadge";
import ReputationBadge from "../common/ReputationBadge";
import { createNotification } from "../notifications/notificationHelpers";
import AIDisputeAnalyzer from "../ai/AIDisputeAnalyzer";
import RoleGuard from "../web3/RoleGuard";
import { useWallet } from "../web3/WalletContext";

export default function ArbitratorDisputeCard({ dispute, resolved = false }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [ruling, setRuling] = useState('');
  const [notes, setNotes] = useState('');
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const queryClient = useQueryClient();
  const { resolveDisputeOnChain } = useWallet();
  
  const { data: trade } = useQuery({
    queryKey: ['trade', dispute.trade_id],
    queryFn: async () => {
      const trades = await base44.entities.Trade.filter({ trade_id: dispute.trade_id });
      return trades[0];
    },
    enabled: !!dispute.trade_id
  });
  
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', dispute.trade_id],
    queryFn: () => base44.entities.ChatMessage.filter({ trade_id: dispute.trade_id }, '-created_date'),
    enabled: !!dispute.trade_id && expanded
  });

  const { data: sellerProfile } = useQuery({
    queryKey: ['seller-profile', trade?.seller_address],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: trade.seller_address });
      return profiles[0] ?? null;
    },
    enabled: !!trade?.seller_address && expanded
  });

  const { data: buyerProfile } = useQuery({
    queryKey: ['buyer-profile', trade?.buyer_address],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: trade.buyer_address });
      return profiles[0] ?? null;
    },
    enabled: !!trade?.buyer_address && expanded
  });

  // Calculate urgency
  const ageHours = (Date.now() - new Date(dispute.created_date).getTime()) / (1000 * 60 * 60);
  const urgencyScore = Math.min(100, (ageHours / 72) * 100);
  
  const resolveDispute = useMutation({
    mutationFn: async ({ disputeId, rulingDecision, rulingNotes }) => {
      const user = await base44.auth.me();
      
      // STEP 1: Resolve dispute on blockchain FIRST
      try {
        // Contract ruling codes: 0=NONE, 1=BUYER_WINS, 2=SELLER_WINS
        const txHash = await resolveDisputeOnChain(
          dispute.trade_id, 
          trade.chain, 
          rulingDecision
        );
        
        toast.info(t('arbitrator.toast.txSubmittedTitle'), {
          description: t('arbitrator.toast.txSubmittedDesc')
        });
      } catch (error) {
        throw new Error(t('arbitrator.toast.resolveChainFailed', { error: error.message }));
      }
      
      // STEP 2: Update database records after blockchain confirmation
      await base44.entities.Dispute.update(disputeId, {
        status: 'resolved',
        ruling: rulingDecision,
        ruling_reason: rulingNotes,
        resolved_at: new Date().toISOString(),
        arbitrator_address: user?.email
      });
      
      // Update trade status
      if (trade) {
        await base44.entities.Trade.update(trade.id, {
          status: 'completed',
          dispute_resolved_at: new Date().toISOString()
        });
        
        // Notify parties
        await Promise.all([
          createNotification({
            userAddress: trade.seller_address,
            type: 'dispute',
            title: t('arbitrator.notifications.disputeResolvedTitle'),
            message: t('arbitrator.notifications.disputeResolvedMessage', {
              ruling: rulingDecision.replace('_', ' ')
            }),
            link: createPageUrl('TradeDetails') + `?id=${trade.id}`,
            priority: 'high',
            metadata: { dispute_id: disputeId, ruling: rulingDecision }
          }),
          createNotification({
            userAddress: trade.buyer_address,
            type: 'dispute',
            title: t('arbitrator.notifications.disputeResolvedTitle'),
            message: t('arbitrator.notifications.disputeResolvedMessage', {
              ruling: rulingDecision.replace('_', ' ')
            }),
            link: createPageUrl('TradeDetails') + `?id=${trade.id}`,
            priority: 'high',
            metadata: { dispute_id: disputeId, ruling: rulingDecision }
          })
        ]);
      }
      
      return { disputeId, rulingDecision };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arbitrator-disputes'] });
      queryClient.invalidateQueries({ queryKey: ['all-disputes'] });
      toast.success(t('arbitrator.toast.resolvedSuccess'));
      setExpanded(false);
    },
    onError: (error) => {
      toast.error(t('arbitrator.toast.resolveFailed', { error: error.message }));
    }
  });
  
  const handleResolve = (decision) => {
    if (!notes.trim()) {
      toast.error(t('arbitrator.toast.notesRequired'));
      return;
    }
    
    const decisionLabel = decision === 'favor_seller'
      ? t('cards.arbitrator.favorSeller')
      : t('cards.arbitrator.favorBuyer');
    const matchNote = aiAnalysis
      ? (decision === aiAnalysis.recommended_ruling
        ? t('cards.arbitrator.confirmMatch')
        : t('cards.arbitrator.confirmOverride'))
      : '';
    const confirmMsg = t('cards.arbitrator.confirmResolve', {
      side: decisionLabel,
      matchNote: matchNote ? ` ${matchNote}` : ''
    });
    
    if (confirm(confirmMsg)) {
      resolveDispute.mutate({
        disputeId: dispute.id,
        rulingDecision: decision,
        rulingNotes: aiAnalysis 
          ? `${notes}\n\n[AI Analysis Reference - Confidence: ${aiAnalysis.confidence_score}% - Recommended: ${aiAnalysis.recommended_ruling}]`
          : notes
      });
    }
  };
  
  const handleAIAnalysisComplete = (analysis) => {
    setAiAnalysis(analysis);
    // Pre-fill notes with AI reasoning if confidence is high
    if (analysis.confidence_score >= 70 && !notes.trim()) {
      const findings = analysis.key_evidence?.slice(0, 3).map((e) => `- ${e}`).join('\n') || '';
      setNotes(t('cards.arbitrator.aiPrefill', {
        confidence: analysis.confidence_score,
        reasoning: analysis.reasoning,
        findings
      }));
    }
  };
  
  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-lg font-semibold text-white">
              {t('cards.arbitrator.disputeNumber')}{dispute.id?.slice(-8)}
            </h3>
            <StatusBadge status={dispute.status} />
            {!resolved && urgencyScore > 75 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
                <AlertCircle className="w-3 h-3 mr-1" />
                {t('cards.arbitrator.urgent')}
              </Badge>
            )}
            {resolved && dispute.ruling && (
              <Badge className={
                dispute.ruling === 'favor_seller'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : dispute.ruling === 'favor_buyer'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
              }>
                {dispute.ruling === 'favor_seller' ? t('cards.arbitrator.sellerWon') : 
                 dispute.ruling === 'favor_buyer' ? t('cards.arbitrator.buyerWon') : t('cards.arbitrator.splitFunds')}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <p className="text-slate-400">
              {t('cards.arbitrator.filed')} {formatDistanceToNow(new Date(dispute.created_date), { addSuffix: true })}
            </p>
            {!resolved && (
              <Badge variant="outline" className={
                urgencyScore > 75 ? 'border-red-500/50 text-red-400' :
                urgencyScore > 50 ? 'border-amber-500/50 text-amber-400' :
                'border-slate-600 text-slate-400'
              }>
                <Clock className="w-3 h-3 mr-1" />
                {t('cards.arbitrator.hoursOld', { hours: ageHours.toFixed(0) })}
              </Badge>
            )}
          </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-white"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
        
        {/* Reason */}
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-4">
          <p className="text-xs text-slate-500 mb-1">{t('cards.arbitrator.disputeReason')}:</p>
          <p className="text-white">{dispute.reason}</p>
          {dispute.description && (
            <p className="text-slate-400 text-sm mt-2">{dispute.description}</p>
          )}
        </div>
        
        {/* Quick Info */}
        {trade && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-800/30">
              <p className="text-xs text-slate-500 mb-1">{t('cards.arbitrator.amount')}</p>
              <p className="text-white font-semibold">{trade.amount} {trade.token_symbol}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/30">
              <p className="text-xs text-slate-500 mb-1">{t('cards.arbitrator.chain')}</p>
              <ChainBadge chain={trade.chain} />
            </div>
            <div className="p-3 rounded-lg bg-slate-800/30">
              <p className="text-xs text-slate-500 mb-1">{t('cards.arbitrator.escalation')}</p>
              <p className="text-white font-semibold">
                {t('cards.arbitrator.tierValue', { level: dispute.escalation_level })}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-slate-700/50 p-6 space-y-6">
          {/* Trade Parties with Reputation */}
          {trade && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('cards.arbitrator.seller')}</span>
                </div>
                <WalletAddress address={trade.seller_address} truncate={false} />
                {sellerProfile && (
                  <div className="mt-2 space-y-1">
                    <ReputationBadge profile={sellerProfile} size="sm" />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-xs">
                        <span className="text-slate-500">{t('cards.arbitrator.tradesLabel')} </span>
                        <span className="text-white">{sellerProfile.total_trades || 0}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-500">{t('cards.arbitrator.successLabel')} </span>
                        <span className="text-emerald-400">
                          {sellerProfile.total_trades > 0 
                            ? ((sellerProfile.successful_trades / sellerProfile.total_trades) * 100).toFixed(0)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('cards.arbitrator.buyer')}</span>
                </div>
                <WalletAddress address={trade.buyer_address} truncate={false} />
                {buyerProfile && (
                  <div className="mt-2 space-y-1">
                    <ReputationBadge profile={buyerProfile} size="sm" />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-xs">
                        <span className="text-slate-500">{t('cards.arbitrator.tradesLabel')} </span>
                        <span className="text-white">{buyerProfile.total_trades || 0}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-500">{t('cards.arbitrator.successLabel')} </span>
                        <span className="text-emerald-400">
                          {buyerProfile.total_trades > 0 
                            ? ((buyerProfile.successful_trades / buyerProfile.total_trades) * 100).toFixed(0)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Evidence */}
          {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-400 mb-3">
                <FileText className="w-4 h-4" />
                <span className="font-medium">{t('cards.arbitrator.evidenceSubmitted')}</span>
              </div>
              <div className="space-y-2">
                {dispute.evidence_urls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    {t('cards.dispute.evidence')} {idx + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {/* Trade Chat History */}
          {messages.length > 0 && (
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-300 mb-3">
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">{t('cards.arbitrator.tradeChat')}</span>
                <Badge variant="outline" className="ml-auto border-slate-600 text-slate-400">
                  {messages.length} {t('cards.arbitrator.messages')}
                </Badge>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {messages.slice(0, 10).map((msg) => (
                  <div key={msg.id} className="p-2 rounded bg-slate-900/50 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-500 text-xs font-mono">
                        {msg.sender_address?.slice(0, 10)}...
                      </span>
                      <span className="text-slate-600 text-xs">
                        {format(new Date(msg.created_date), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    <p className="text-slate-300">{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Payment Evidence */}
          {trade?.payment_evidence && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-400 mb-3">
                <FileText className="w-4 h-4" />
                <span className="font-medium">{t('cards.arbitrator.paymentEvidence')}</span>
              </div>
              <div className="space-y-2 text-sm">
                {trade.payment_evidence.transactionId && (
                  <div>
                    <span className="text-slate-400">{t('cards.arbitrator.transactionId')}: </span>
                    <span className="text-white font-mono">{trade.payment_evidence.transactionId}</span>
                  </div>
                )}
                {trade.payment_evidence.notes && (
                  <div>
                    <span className="text-slate-400">{t('cards.arbitrator.notes')}: </span>
                    <span className="text-slate-300">{trade.payment_evidence.notes}</span>
                  </div>
                )}
                {trade.payment_evidence.screenshots && trade.payment_evidence.screenshots.length > 0 && (
                  <div>
                    <span className="text-slate-400">{t('cards.arbitrator.screenshots')}: </span>
                    {trade.payment_evidence.screenshots.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline ml-2"
                      >
                        {t('cards.arbitrator.screenshots')} {idx + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* AI Analysis */}
          {!resolved && (
            <AIDisputeAnalyzer 
              dispute={dispute}
              trade={trade}
              messages={messages}
              onAnalysisComplete={handleAIAnalysisComplete}
            />
          )}
          
          {/* Case Summary */}
          {!resolved && (
            <Alert className="bg-purple-500/10 border-purple-500/30">
              <Info className="h-4 w-4 text-purple-400" />
              <AlertDescription className="text-purple-300 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t('cards.arbitrator.caseAge')}:</span>
                    <span className="font-semibold">
                      {t('cards.arbitrator.caseAgeValue', { hours: ageHours.toFixed(0) })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('cards.arbitrator.tradeValue')}:</span>
                    <span className="font-semibold">{trade?.amount} {trade?.token_symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('cards.arbitrator.urgencyLevel')}:</span>
                    <Badge className={
                      urgencyScore > 75 ? 'bg-red-500/20 text-red-400' :
                      urgencyScore > 50 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }>
                      {urgencyScore > 75
                        ? t('cards.arbitrator.urgency.critical')
                        : urgencyScore > 50
                        ? t('cards.arbitrator.urgency.high')
                        : t('cards.arbitrator.urgency.normal')}
                    </Badge>
                  </div>
                  <Progress value={urgencyScore} className="h-1 mt-2" />
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Ruling Section (for pending disputes) - ARBITRATOR ROLE REQUIRED */}
          {!resolved && (
            <RoleGuard requiredRole="ARBITRATOR_ROLE">
            <div className="pt-6 border-t border-slate-700/50 space-y-4">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <h4 className="text-sm font-semibold text-white mb-2">{t('cards.arbitrator.rulingOptions')}</h4>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• <strong>{t('cards.arbitrator.favorSeller')}:</strong> {t('cards.arbitrator.fullEscrow')}</li>
                  <li>• <strong>{t('cards.arbitrator.favorBuyer')}:</strong> {t('cards.arbitrator.fullRefund')}</li>
                  <li>• <strong>{t('cards.arbitrator.splitFunds')}:</strong> {t('cards.arbitrator.fundsDivided')}</li>
                </ul>
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">
                  {t('cards.arbitrator.arbitrationNotes')} *
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('cards.arbitrator.rulingNotesPlaceholder')}
                  className="bg-slate-800 border-slate-700 min-h-[120px]"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => handleResolve('favor_seller')}
                  disabled={resolveDispute.isPending || !notes.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-sm"
                >
                  {resolveDispute.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('tradeDetails.seller')}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => handleResolve('split')}
                  disabled={resolveDispute.isPending || !notes.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-sm"
                >
                      {resolveDispute.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ArrowLeftRight className="w-4 h-4 mr-2" />
                          {t('cards.arbitrator.splitFunds')}
                        </>
                      )}
                    </Button>
                
                <Button
                  onClick={() => handleResolve('favor_buyer')}
                  disabled={resolveDispute.isPending || !notes.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-sm"
                >
                  {resolveDispute.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('tradeDetails.buyer')}
                    </>
                  )}
                </Button>
              </div>

              {!notes.trim() && (
                <p className="text-xs text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {t('cards.arbitrator.rulingNotesRequired')}
                </p>
              )}

              <Link to={createPageUrl(`TradeDetails?id=${trade?.id}`)}>
                <Button variant="outline" className="w-full border-slate-600">
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  {t('cards.arbitrator.viewFullEscrow')}
                </Button>
              </Link>
            </div>
            </RoleGuard>
          )}
          
          {/* Resolved Info */}
          {resolved && dispute.ruling_reason && (
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-300 mb-2">
                <Scale className="w-4 h-4" />
                <span className="font-medium">{t('cards.arbitrator.rulingNotes')}</span>
              </div>
              <p className="text-slate-400 text-sm">{dispute.ruling_reason}</p>
              {dispute.resolved_at && (
                <p className="text-slate-500 text-xs mt-2">
                  {t('cards.arbitrator.resolvedOn')} {format(new Date(dispute.resolved_at), 'MMM d, yyyy HH:mm')}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
