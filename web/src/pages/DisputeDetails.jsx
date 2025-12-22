import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import AIAnalysis from "../components/dispute/AIAnalysis";
import Tier2Arbitration from "../components/dispute/Tier2Arbitration";
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  User,
  FileText,
  Scale,
  Loader2,
  Upload,
  CheckCircle,
  Gavel,
  Users,
  Bot,
  Shield
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import StatusBadge from "../components/common/StatusBadge";
import WalletAddress from "../components/common/WalletAddress";
import { createNotification, NotificationTemplates } from "../components/notifications/notificationHelpers";
import DisputeResolutionPanel from "../components/trade/DisputeResolutionPanel";
import DisputeTimeline from "../components/dispute/DisputeTimeline";
import { useWallet } from "../components/web3/WalletContext";

export default function DisputeDetails() {
  const { t } = useTranslation();
  const { escrowId } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const disputeId = urlParams.get('id');
  const disputeKey = disputeId || escrowId;
  const { resolveDisputeOnChain, getBondAmount } = useWallet();
  
  const queryClient = useQueryClient();
  const [ruling, setRuling] = useState('');
  const [rulingReason, setRulingReason] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [tier2Analysis, setTier2Analysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bondAmount, setBondAmount] = useState(null);
  const escalationConfig = {
    1: {
      label: t('disputeDetails.escalation.aiReview'),
      icon: Bot,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      description: t('disputeDetails.escalation.aiReviewDesc')
    },
    2: {
      label: t('disputeDetails.escalation.humanArbitration'),
      icon: Gavel,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      description: t('disputeDetails.escalation.humanArbitrationDesc')
    },
    3: {
      label: t('disputeDetails.escalation.daoGovernance'),
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      description: t('disputeDetails.escalation.daoGovernanceDesc')
    }
  };
  
  const { data: dispute, isLoading } = useQuery({
    queryKey: ['dispute', disputeKey],
    queryFn: async () => {
      if (disputeId) {
        const disputes = await base44.entities.Dispute.filter({ id: disputeId });
        return disputes[0];
      }
      if (escrowId) {
        const disputes = await base44.entities.Dispute.filter({ trade_id: escrowId });
        return disputes[0];
      }
      return null;
    },
    enabled: !!disputeKey
  });
  const disputeRecordId = dispute?.id || disputeId;
  
  const { data: trade } = useQuery({
    queryKey: ['trade', dispute?.trade_id],
    queryFn: async () => {
      const trades = await base44.entities.Trade.filter({ id: dispute.trade_id });
      return trades[0];
    },
    enabled: !!dispute?.trade_id
  });
  
  const { data: messages = [] } = useQuery({
    queryKey: ['trade-messages', dispute?.trade_id],
    queryFn: () => base44.entities.ChatMessage.filter({ trade_id: dispute.trade_id }),
    enabled: !!dispute?.trade_id
  });
  
  // Fetch bond from smart contract
  useEffect(() => {
    const fetchBond = async () => {
      if (trade?.amount && trade?.chain && getBondAmount) {
        try {
          const bond = await getBondAmount(trade.chain, trade.amount);
          setBondAmount(bond);
        } catch (error) {
          console.error('Error fetching bond amount:', error);
        }
      }
    };
    fetchBond();
  }, [trade?.amount, trade?.chain, getBondAmount]);
  
  // Trigger AI analysis for automated_review status (Tier 1)
  useEffect(() => {
    if (dispute?.status === 'automated_review' && !aiAnalysis && !isAnalyzing) {
      runAIAnalysis();
    }
  }, [dispute?.status]);
  
  // Trigger Tier 2 AI arbitration when escalated
  useEffect(() => {
    if (dispute?.status === 'arbitration' && dispute?.escalation_level === 2 && !tier2Analysis && !isAnalyzing) {
      runTier2Arbitration();
    }
  }, [dispute?.status, dispute?.escalation_level]);
  
  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Prepare context for AI
      const chatContext = messages.map(m => 
        `${m.sender_address === trade.seller_address ? 'Seller' : 'Buyer'}: ${m.content}`
      ).join('\n');
      
      const evidenceContext = dispute.evidence_urls?.length > 0 
        ? `Evidence files provided: ${dispute.evidence_urls.length} documents` 
        : 'No evidence files submitted';
      
      const prompt = `You are an AI arbitrator analyzing an escrow dispute. Provide a fair, unbiased ruling based on the evidence.

DISPUTE DETAILS:
- Reason: ${dispute.reason}
- Description: ${dispute.description}
- Escrow Amount: $${trade.amount} ${trade.token_symbol}
- Chain: ${trade.chain}

CHAT HISTORY:
${chatContext || 'No chat messages available'}

EVIDENCE:
${evidenceContext}

ESCROW STATUS:
- Seller signed: ${trade.seller_signed}
- Buyer signed: ${trade.buyer_signed}
- Current status: ${trade.status}

Analyze this dispute and provide:
1. A suggested ruling (favor_seller, favor_buyer, or split)
2. Confidence score (0-100)
3. Detailed reasoning (2-3 sentences)
4. Chat sentiment analysis
5. Evidence quality assessment
6. Key findings (3-5 bullet points)

Return as JSON with this structure:
{
  "suggested_ruling": "favor_seller|favor_buyer|split",
  "confidence_score": 85,
  "reasoning": "detailed explanation",
  "factors": {
    "chat_sentiment": "Positive|Neutral|Negative",
    "evidence_quality": "Strong|Moderate|Weak",
    "pattern_confidence": "High|Medium|Low"
  },
  "key_points": ["point 1", "point 2", "point 3"]
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggested_ruling: { type: "string" },
            confidence_score: { type: "number" },
            reasoning: { type: "string" },
            factors: {
              type: "object",
              properties: {
                chat_sentiment: { type: "string" },
                evidence_quality: { type: "string" },
                pattern_confidence: { type: "string" }
              }
            },
            key_points: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      setAiAnalysis(result);
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast.error(t('disputeDetails.toast.aiFailedEscalate'));
      // Auto-escalate on failure
      updateDispute.mutate({
        id: disputeRecordId,
        data: { 
          escalation_level: 2,
          status: 'arbitration'
        }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const updateDispute = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Dispute.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispute', disputeKey] });
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      toast.success(t('disputeDetails.toast.disputeUpdated'));
    }
  });
  
  const handleEscalate = async () => {
    if (dispute.escalation_level < 3) {
      const newLevel = dispute.escalation_level + 1;
      const statusMap = { 2: 'arbitration', 3: 'dao_vote' };
      updateDispute.mutate({
        id: disputeRecordId,
        data: { 
          escalation_level: newLevel,
          status: statusMap[newLevel]
        }
      });
      
      // Notify both parties
      const notifData = NotificationTemplates.disputeEscalated(disputeRecordId, newLevel);
      await createNotification({
        userAddress: trade.seller_address,
        ...notifData,
        metadata: { dispute_id: disputeRecordId, trade_id: dispute.trade_id }
      });
      await createNotification({
        userAddress: trade.buyer_address,
        ...notifData,
        metadata: { dispute_id: disputeRecordId, trade_id: dispute.trade_id }
      });
    }
  };
  
  const handleAcceptAIRuling = async () => {
    if (!aiAnalysis) return;
    
    try {
      // STEP 1: Execute on blockchain
      await resolveDisputeOnChain(dispute.trade_id, trade.chain, aiAnalysis.suggested_ruling);
      
      toast.info(t('disputeDetails.toast.resolvingOnChain'));
      
      // STEP 2: Update database
      updateDispute.mutate({
        id: disputeRecordId,
        data: {
          ruling: aiAnalysis.suggested_ruling,
          ruling_reason: `AI Analysis (${aiAnalysis.confidence_score}% confidence): ${aiAnalysis.reasoning}`,
          status: 'resolved',
          resolved_at: new Date().toISOString()
        }
      });
      
      // Update trade status
      if (trade) {
        await base44.entities.Trade.update(trade.id, { 
          status: 'completed' 
        });
      }
      
      // Process insurance claim if applicable
      handleInsuranceClaim(aiAnalysis.suggested_ruling);
      
      // Notify both parties
      const notifData = NotificationTemplates.disputeResolved(disputeRecordId, aiAnalysis.suggested_ruling);
      await createNotification({
        userAddress: trade.seller_address,
        ...notifData,
        metadata: { dispute_id: disputeRecordId, trade_id: dispute.trade_id }
      });
      await createNotification({
        userAddress: trade.buyer_address,
        ...notifData,
        metadata: { dispute_id: disputeRecordId, trade_id: dispute.trade_id }
      });
      
      toast.success(t('disputeDetails.toast.aiRulingAccepted'));
    } catch (error) {
      toast.error(`${t('disputeDetails.toast.resolveFailed')}: ${error.message}`);
    }
  };
  
  const handleContestAIRuling = () => {
    updateDispute.mutate({
      id: disputeRecordId,
      data: {
        escalation_level: 2,
        status: 'arbitration'
      }
    });
    
    toast.info(t('disputeDetails.toast.escalatedTier2'));
  };
  
  const runTier2Arbitration = async () => {
    setIsAnalyzing(true);
    
    try {
      const chatContext = messages.map(m => 
        `${m.sender_address === trade.seller_address ? 'Seller' : 'Buyer'}: ${m.content}`
      ).join('\n');
      
      const evidenceContext = dispute.evidence_urls?.length > 0 
        ? `Evidence files: ${dispute.evidence_urls.length} documents submitted` 
        : 'No evidence files';
      
      // Include Tier 1 ruling in context if available
      const tier1Context = dispute.ruling_reason 
        ? `Previous Tier 1 AI Analysis: ${dispute.ruling_reason}`
        : 'No previous AI ruling available';
      
      const prompt = `You are a Tier 2 AI arbitrator conducting a comprehensive dispute review. This is a second-level analysis after Tier 1 ruling was contested.

DISPUTE DETAILS:
- Reason: ${dispute.reason}
- Description: ${dispute.description}
- Escrow Amount: $${trade.amount} ${trade.token_symbol}
- Chain: ${trade.chain}

TIER 1 REVIEW:
${tier1Context}

CONTESTATION REASON:
The disputing party contested the Tier 1 ruling and requested human arbitration. You must provide a thorough, unbiased review.

CHAT HISTORY:
${chatContext || 'No chat messages available'}

EVIDENCE:
${evidenceContext}

ESCROW STATUS:
- Seller signed: ${trade.seller_signed}
- Buyer signed: ${trade.buyer_signed}
- Current status: ${trade.status}
- Initiator: ${dispute.initiator_address === trade.seller_address ? 'Seller' : 'Buyer'}

Conduct a comprehensive Tier 2 arbitration analysis:

1. Review the Tier 1 ruling - was it justified or should it be overturned?
2. Analyze why the party contested the initial ruling
3. Examine all evidence with deeper scrutiny
4. Consider legal precedents and platform terms
5. Provide a final binding decision with high confidence

Return detailed JSON:
{
  "final_ruling": "favor_seller|favor_buyer|split",
  "confidence_score": 90,
  "reasoning": "comprehensive 3-4 sentence explanation of final decision",
  "tier1_review": "assessment of whether Tier 1 ruling was correct or should be overturned",
  "contestation_addressed": "specific response to why the ruling was contested",
  "factors": {
    "evidence_strength": "Weak|Moderate|Strong|Overwhelming",
    "fairness_score": "85/100",
    "precedent_match": "Low|Medium|High"
  },
  "key_findings": ["finding 1", "finding 2", "finding 3"],
  "risk_assessment": "assessment of any risks or concerns with this ruling"
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            final_ruling: { type: "string" },
            confidence_score: { type: "number" },
            reasoning: { type: "string" },
            tier1_review: { type: "string" },
            contestation_addressed: { type: "string" },
            factors: {
              type: "object",
              properties: {
                evidence_strength: { type: "string" },
                fairness_score: { type: "string" },
                precedent_match: { type: "string" }
              }
            },
            key_findings: { type: "array", items: { type: "string" } },
            risk_assessment: { type: "string" }
          }
        }
      });
      
      setTier2Analysis(result);
    } catch (error) {
      console.error('Tier 2 arbitration failed:', error);
      toast.error(t('disputeDetails.toast.tier2Failed'));
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleAcceptTier2Ruling = async () => {
    if (!tier2Analysis) return;
    
    try {
      // STEP 1: Execute on blockchain
      await resolveDisputeOnChain(dispute.trade_id, trade.chain, tier2Analysis.final_ruling);
      
      toast.info(t('disputeDetails.toast.resolvingOnChain'));
      
      // STEP 2: Update database
      updateDispute.mutate({
        id: disputeRecordId,
        data: {
          ruling: tier2Analysis.final_ruling,
          ruling_reason: `Tier 2 AI Arbitration (${tier2Analysis.confidence_score}% confidence): ${tier2Analysis.reasoning}`,
          status: 'resolved',
          resolved_at: new Date().toISOString()
        }
      });
      
      // Update trade status
      if (trade) {
        await base44.entities.Trade.update(trade.id, { 
          status: 'completed' 
        });
      }
      
      // Process insurance claim
      handleInsuranceClaim(tier2Analysis.final_ruling);
      
      toast.success(t('disputeDetails.toast.tier2Accepted'));
    } catch (error) {
      toast.error(`${t('disputeDetails.toast.resolveFailed')}: ${error.message}`);
    }
  };
  
  const handleEscalateToDAO = () => {
    updateDispute.mutate({
      id: disputeRecordId,
      data: {
        escalation_level: 3,
        status: 'dao_vote'
      }
    });
    
    toast.info(t('disputeDetails.toast.escalatedDao'));
  };
  
  const handleInsuranceClaim = async (ruling) => {
    // Check if trade has insurance
    const policies = await base44.entities.InsurancePolicy.filter({ trade_id: dispute.trade_id });
    const activePolicy = policies.find(p => p.status === 'active');
    
    if (!activePolicy) return;
    
    // Auto-process claim based on ruling
    const shouldProcessClaim = 
      (ruling === 'favor_buyer' && activePolicy.insured_address === trade.seller_address) ||
      (ruling === 'favor_seller' && activePolicy.insured_address === trade.buyer_address);
    
    if (shouldProcessClaim) {
      const claimId = `0xC${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`;
      
      await base44.entities.InsuranceClaim.create({
        claim_id: claimId,
        policy_id: activePolicy.id,
        trade_id: dispute.trade_id,
        dispute_id: disputeRecordId,
        claimant_address: activePolicy.insured_address,
        provider_id: activePolicy.provider_id,
        claim_amount: activePolicy.coverage_amount,
        claim_reason: 'dispute_lost',
        claim_description: `Automated claim based on dispute resolution: ${ruling}`,
        evidence_urls: dispute.evidence_urls || [],
        status: 'approved',
        auto_processed: true,
        approval_reason: `Automatically approved based on AI dispute resolution`,
        payout_amount: activePolicy.coverage_amount * 0.5, // 50% payout
        processing_time_hours: 0
      });
      
      // Update policy status
      await base44.entities.InsurancePolicy.update(activePolicy.id, {
        status: 'claimed',
        claim_id: claimId
      });
    }
  };
  
  const handleSubmitRuling = async () => {
    if (!ruling) {
      toast.error(t('disputeDetails.toast.selectRuling'));
      return;
    }

    if (!rulingReason.trim()) {
      toast.error(t('disputeDetails.toast.provideNotes'));
      return;
    }
    
    try {
      // STEP 1: Execute on blockchain FIRST
      await resolveDisputeOnChain(dispute.trade_id, trade.chain, ruling);
      
      toast.info(t('disputeDetails.toast.txSubmitted'), {
        description: t('disputeDetails.toast.txWaiting')
      });
      
      // STEP 2: Update database after blockchain confirmation
      updateDispute.mutate({
        id: disputeRecordId,
        data: {
          ruling,
          ruling_reason: rulingReason,
          status: 'resolved',
          resolved_at: new Date().toISOString()
        }
      });
      
      // Update trade status
      if (trade) {
        await base44.entities.Trade.update(trade.id, { 
          status: 'completed' 
        });
      }
    } catch (error) {
      toast.error(`${t('disputeDetails.toast.resolveFailed')}: ${error.message}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }
  
  if (!dispute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('disputeDetails.notFoundTitle')}</h2>
          <p className="text-slate-400 mb-6">{t('disputeDetails.notFoundBody')}</p>
          <Link to={createPageUrl('Disputes')}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('disputeDetails.backToDisputes')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const escalation = escalationConfig[dispute.escalation_level] || escalationConfig[1];
  const EscalationIcon = escalation.icon;
  
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
          <Link to={createPageUrl('Appeal')}>
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('disputeDetails.back')}
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{t('disputeDetails.title')}</h1>
              <StatusBadge status={dispute.status} />
              <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${escalation.bg} ${escalation.color}`}>
                <EscalationIcon className="w-3 h-3" />
                {escalation.label}
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bond Stakes Panel */}
            {trade && bondAmount && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <DisputeResolutionPanel dispute={dispute} trade={trade} bondAmount={bondAmount} />
              </motion.div>
            )}
            
            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DisputeTimeline dispute={dispute} />
            </motion.div>

            {/* Dispute Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-red-500/10">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-white mb-1">
                      {dispute.reason}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      {t('disputeDetails.opened')} {dispute.created_date && format(new Date(dispute.created_date), "MMM d, yyyy 'at' HH:mm")}
                    </div>
                  </div>
                </div>
                
                {dispute.description && (
                  <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <p className="text-slate-300">{dispute.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('disputeDetails.initiatedBy')}</span>
                    </div>
                    <WalletAddress address={dispute.initiator_address} truncate={false} />
                  </div>
                  
                  {dispute.arbitrator_address && (
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-center gap-2 text-slate-400 mb-3">
                        <Gavel className="w-4 h-4" />
                        <span className="text-sm font-medium">{t('disputeDetails.arbitrator')}</span>
                      </div>
                      <WalletAddress address={dispute.arbitrator_address} truncate={false} />
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
            
            {/* Tier 1 AI Analysis */}
            {(dispute.status === 'automated_review' && dispute.escalation_level === 1) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {isAnalyzing ? (
                  <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{t('disputeDetails.aiProgressTitle')}</h3>
                        <p className="text-sm text-slate-400">
                          {t('disputeDetails.aiProgressBody')}
                        </p>
                      </div>
                    </div>
                  </Card>
                ) : aiAnalysis ? (
                  <AIAnalysis
                    analysis={aiAnalysis}
                    onAccept={handleAcceptAIRuling}
                    onContest={handleContestAIRuling}
                    isProcessing={updateDispute.isPending}
                  />
                ) : null}
              </motion.div>
            )}
            
            {/* Tier 2 AI Arbitration */}
            {dispute.status === 'arbitration' && dispute.escalation_level === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {isAnalyzing ? (
                  <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{t('disputeDetails.tier2ProgressTitle')}</h3>
                        <p className="text-sm text-slate-400">
                          {t('disputeDetails.tier2ProgressBody')}
                        </p>
                      </div>
                    </div>
                  </Card>
                ) : tier2Analysis ? (
                  <Tier2Arbitration
                    analysis={tier2Analysis}
                    onAccept={handleAcceptTier2Ruling}
                    onEscalateToDAO={handleEscalateToDAO}
                    isProcessing={updateDispute.isPending}
                  />
                ) : null}
              </motion.div>
            )}
            
            {/* Evidence */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-400" />
                  {t('disputeDetails.evidenceTitle')}
                </h3>
                
                {dispute.evidence_urls?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {dispute.evidence_urls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 transition-colors text-center"
                      >
                        <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-300">
                          {t('disputeDetails.evidenceItem', { index: index + 1 })}
                        </p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-lg">
                    <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500">{t('disputeDetails.noEvidence')}</p>
                  </div>
                )}
              </Card>
            </motion.div>
            
            {/* Related Escrow */}
            {trade && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">{t('disputeDetails.relatedEscrow')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">{t('disputeDetails.fields.amount')}</p>
                      <p className="text-white font-semibold">{trade.amount} {trade.token_symbol}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">{t('disputeDetails.fields.chain')}</p>
                      <p className="text-white font-semibold">{trade.chain}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">{t('disputeDetails.fields.seller')}</p>
                      <p className="text-white font-mono text-xs">{trade.seller_address?.slice(0, 10)}...</p>
                    </div>
                    <div>
                      <p className="text-slate-500">{t('disputeDetails.fields.buyer')}</p>
                      <p className="text-white font-mono text-xs">{trade.buyer_address?.slice(0, 10)}...</p>
                    </div>
                  </div>
                  <Link to={createPageUrl(`TradeDetails?id=${trade.id}`)}>
                    <Button variant="outline" className="mt-4 border-slate-600 text-slate-300 hover:bg-slate-700">
                      {t('disputeDetails.viewEscrowDetails')}
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            )}
          </div>
          
          {/* Actions Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Escalation Progress */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{t('disputeDetails.resolutionProgress')}</h3>
              
              <div className="space-y-4">
                {[1, 2, 3].map((level) => {
                  const config = escalationConfig[level];
                  const Icon = config.icon;
                  const isActive = dispute.escalation_level >= level;
                  const isCurrent = dispute.escalation_level === level;
                  
                  return (
                    <div 
                      key={level}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                        isCurrent ? 'bg-slate-800/80 border border-slate-600' : 
                        isActive ? 'opacity-50' : 'opacity-30'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div>
                        <p className={`font-medium ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                          {config.label}
                        </p>
                        <p className="text-xs text-slate-500">{config.description}</p>
                      </div>
                      {isActive && !isCurrent && (
                        <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
                      )}
                    </div>
                  );
                })}
              </div>
              
              {dispute.status !== 'resolved' && dispute.escalation_level < 3 && (
                <Button
                  onClick={handleEscalate}
                  disabled={updateDispute.isPending}
                  variant="outline"
                  className="w-full mt-4 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                >
                  {t('disputeDetails.escalateTo', {
                    level: escalationConfig[dispute.escalation_level + 1]?.label
                  })}
                </Button>
              )}
            </Card>
            
            {/* Manual Ruling (for DAO or manual override) */}
            {dispute.status !== 'resolved' && dispute.status !== 'automated_review' && dispute.escalation_level === 3 && (
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  {t('disputeDetails.submitRuling')}
                </h3>
                
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 text-sm font-semibold">{t('disputeDetails.bondDistribution')}</span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    Winner DisputeBond is refunded. Loser DisputeBond is forfeited to Treasury. Escrow outcome is enforced on-chain.
                  </p>
                </div>
                
                <RadioGroup value={ruling} onValueChange={setRuling} className="space-y-3">
                  <div className="flex flex-col space-y-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="favor_seller" id="seller" />
                      <Label htmlFor="seller" className="text-slate-300 cursor-pointer font-medium">
                        {t('disputeDetails.sellerWins')}
                      </Label>
                    </div>
                    <p className="text-xs text-slate-400 ml-7">
                      {t('disputeDetails.sellerWinsDesc')}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="favor_buyer" id="buyer" />
                      <Label htmlFor="buyer" className="text-slate-300 cursor-pointer font-medium">
                        {t('disputeDetails.buyerWins')}
                      </Label>
                    </div>
                    <p className="text-xs text-slate-400 ml-7">
                      {t('disputeDetails.buyerWinsDesc')}
                    </p>
                  </div>
                </RadioGroup>

                <Textarea
                  placeholder={t('disputeDetails.rulingPlaceholder')}
                  value={rulingReason}
                  onChange={(e) => setRulingReason(e.target.value)}
                  className="mt-4 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
                />
                
                <Button
                  onClick={handleSubmitRuling}
                  disabled={updateDispute.isPending || !ruling}
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
                >
                  {updateDispute.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Gavel className="w-4 h-4 mr-2" />
                      {t('disputeDetails.submitRulingAction')}
                    </>
                  )}
                </Button>
              </Card>
            )}
            
            {/* Resolved */}
            {dispute.status === 'resolved' && (
              <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30 p-6">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">{t('disputeDetails.resolvedTitle')}</h3>
                  <p className="text-emerald-400 font-medium capitalize mb-4">
                    {dispute.ruling?.replace('_', ' ')}
                  </p>

                  {/* Payout Breakdown */}
                  {bondAmount && (
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-4 text-left">
                      <p className="text-sm font-semibold text-white mb-3">{t('disputeDetails.payoutDistribution')}</p>
                      <div className="space-y-2 text-xs">
                        {dispute.ruling === 'favor_buyer' && (
                          <>
                            <div className="flex justify-between text-emerald-300">
                              <span>Buyer receives</span>
                              <span className="font-bold">DisputeBond refund</span>
                            </div>
                            <div className="flex justify-between text-red-300">
                              <span>Seller forfeits</span>
                              <span className="font-bold">DisputeBond to Treasury</span>
                            </div>
                          </>
                        )}
                        {dispute.ruling === 'favor_seller' && (
                          <>
                            <div className="flex justify-between text-blue-300">
                              <span>Seller receives</span>
                              <span className="font-bold">DisputeBond refund</span>
                            </div>
                            <div className="flex justify-between text-red-300">
                              <span>Buyer forfeits</span>
                              <span className="font-bold">DisputeBond to Treasury</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {dispute.ruling_reason && (
                    <p className="text-slate-400 text-sm mt-3">{dispute.ruling_reason}</p>
                  )}
                  {dispute.resolved_at && (
                    <p className="text-slate-500 text-xs mt-3">
                      {t('disputeDetails.resolvedOn')} {format(new Date(dispute.resolved_at), "MMM d, yyyy 'at' HH:mm")}
                    </p>
                  )}
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
