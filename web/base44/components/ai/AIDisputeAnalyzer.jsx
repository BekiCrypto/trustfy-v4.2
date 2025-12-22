import { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Loader2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  Shield,
  Zap
} from "lucide-react";
import { toast } from "sonner";

export default function AIDisputeAnalyzer({ dispute, trade, messages = [], onAnalysisComplete }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  
  const analyzeDispute = async () => {
    setAnalyzing(true);
    
    try {
      // Prepare comprehensive analysis data
      const analysisPrompt = `
You are an AI arbitrator analyzing a P2P cryptocurrency trade dispute. Provide a detailed, fair analysis.

**Trade Details:**
- Trade ID: ${trade?.trade_id || 'N/A'}
- Token: ${trade?.token_symbol || 'N/A'}
- Amount: ${trade?.amount || 0}
- Price per unit: ${trade?.price_per_unit || 0}
- Total fiat: ${trade?.total_fiat_amount || 0} ${trade?.fiat_currency || 'USD'}
- Chain: ${trade?.chain || 'N/A'}
- Status: ${trade?.status || 'N/A'}

**Dispute Information:**
- Reason: ${dispute.reason}
- Description: ${dispute.description || 'No additional description'}
- Initiated by: ${dispute.initiator_address}
- Escalation Level: ${dispute.escalation_level}
- Filed: ${new Date(dispute.created_date).toLocaleString()}

**Trade Parties:**
- Seller: ${trade?.seller_address}
- Buyer: ${trade?.buyer_address}

**Communication Log:**
${messages.length > 0 ? messages.slice(0, 20).map((m) => 
  `[${new Date(m.created_date).toLocaleString()}] ${m.sender_address.slice(0, 10)}...: ${m.content}`
).join('\n') : 'No communication logs available'}

**Payment Evidence:**
${trade?.payment_evidence ? `
- Transaction ID: ${trade.payment_evidence.transactionId || 'Not provided'}
- Notes: ${trade.payment_evidence.notes || 'No notes'}
- Screenshots: ${trade.payment_evidence.screenshots?.length || 0} file(s)
` : 'No payment evidence submitted'}

**Additional Evidence:**
${dispute.evidence_urls && dispute.evidence_urls.length > 0 ? 
  `${dispute.evidence_urls.length} evidence file(s) submitted` : 
  'No additional evidence'
}

**Analysis Task:**
Analyze this dispute thoroughly and provide:
1. A comprehensive summary of the situation
2. Key evidence and communication patterns
3. Red flags or concerns identified
4. Recommended ruling with detailed reasoning
5. Confidence score (0-100) in your recommendation
6. Risk factors that might affect the decision
7. Suggestions for arbitrators to consider

Be objective, fair, and base your analysis on facts and evidence. Consider both parties' perspectives.
`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_evidence: { 
              type: "array",
              items: { type: "string" }
            },
            red_flags: {
              type: "array",
              items: { type: "string" }
            },
            recommended_ruling: {
              type: "string",
              enum: ["favor_seller", "favor_buyer", "split"]
            },
            confidence_score: { type: "number" },
            reasoning: { type: "string" },
            risk_factors: {
              type: "array",
              items: { type: "string" }
            },
            arbitrator_notes: { type: "string" }
          },
          required: ["summary", "recommended_ruling", "confidence_score", "reasoning"]
        }
      });
      
      setAnalysis(result);
      
      // Auto-resolve if high confidence and enabled
      if (result.confidence_score >= 90 && result.recommended_ruling !== 'split') {
        // Store AI analysis in dispute metadata
        await base44.entities.Dispute.update(dispute.id, {
          ai_analysis: result,
          ai_confidence: result.confidence_score,
          ai_recommendation: result.recommended_ruling,
          status: 'automated_review'
        });
      }
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
      
      toast.success('AI analysis completed');
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast.error('Failed to analyze dispute');
    } finally {
      setAnalyzing(false);
    }
  };
  
  const getConfidenceColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };
  
  const getConfidenceBg = (score) => {
    if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
    if (score >= 60) return 'bg-blue-500/20 border-blue-500/30';
    if (score >= 40) return 'bg-amber-500/20 border-amber-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };
  
  const getRulingLabel = (ruling) => {
    switch(ruling) {
      case 'favor_seller': return 'Favor Seller';
      case 'favor_buyer': return 'Favor Buyer';
      case 'split': return 'Split Decision';
      default: return ruling;
    }
  };
  
  const getRulingIcon = (ruling) => {
    switch(ruling) {
      case 'favor_seller': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'favor_buyer': return <CheckCircle className="w-5 h-5 text-blue-400" />;
      case 'split': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };
  
  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30 p-6">
      {!analysis ? (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Dispute Analysis</h3>
          <p className="text-slate-400 text-sm mb-6">
            Analyze trade details, communication logs, and evidence to get an AI recommendation
          </p>
          <Button
            onClick={analyzeDispute}
            disabled={analyzing}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Run AI Analysis
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">AI Analysis Complete</h3>
                <p className="text-slate-400 text-xs">Recommendation based on evidence review</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={analyzeDispute}
              disabled={analyzing}
              className="text-slate-400 hover:text-white"
            >
              Re-analyze
            </Button>
          </div>
          
          {/* Confidence Score */}
          <Card className={`p-4 border ${getConfidenceBg(analysis.confidence_score)}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Confidence Score</span>
              <span className={`text-2xl font-bold ${getConfidenceColor(analysis.confidence_score)}`}>
                {analysis.confidence_score}%
              </span>
            </div>
            <Progress 
              value={analysis.confidence_score} 
              className="h-2"
            />
            <p className="text-xs text-slate-400 mt-2">
              {analysis.confidence_score >= 80 && 'High confidence - Strong evidence'}
              {analysis.confidence_score >= 60 && analysis.confidence_score < 80 && 'Moderate confidence - Review recommended'}
              {analysis.confidence_score >= 40 && analysis.confidence_score < 60 && 'Low confidence - Manual review required'}
              {analysis.confidence_score < 40 && 'Very low confidence - Complex case'}
            </p>
          </Card>
          
          {/* Recommended Ruling */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              {getRulingIcon(analysis.recommended_ruling)}
              <span className="font-semibold text-white">
                Recommended: {getRulingLabel(analysis.recommended_ruling)}
              </span>
            </div>
            <p className="text-slate-300 text-sm">{analysis.reasoning}</p>
          </div>
          
          {/* Summary */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-300">
              <FileText className="w-4 h-4" />
              <span className="font-medium text-sm">Case Summary</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">{analysis.summary}</p>
          </div>
          
          {/* Key Evidence */}
          {analysis.key_evidence && analysis.key_evidence.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium text-sm">Key Evidence</span>
              </div>
              <ul className="space-y-2">
                {analysis.key_evidence.map((evidence, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-emerald-400 mt-1">•</span>
                    <span>{evidence}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Red Flags */}
          {analysis.red_flags && analysis.red_flags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium text-sm">Red Flags</span>
              </div>
              <ul className="space-y-2">
                {analysis.red_flags.map((flag, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-red-400 mt-1">⚠</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Risk Factors */}
          {analysis.risk_factors && analysis.risk_factors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Shield className="w-4 h-4" />
                <span className="font-medium text-sm">Risk Factors</span>
              </div>
              <ul className="space-y-2">
                {analysis.risk_factors.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-amber-400 mt-1">!</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Arbitrator Notes */}
          {analysis.arbitrator_notes && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium text-sm">Suggestions for Arbitrators</span>
              </div>
              <p className="text-slate-300 text-sm">{analysis.arbitrator_notes}</p>
            </div>
          )}
          
          {/* Disclaimer */}
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 leading-relaxed">
              ⚠️ <strong>Important:</strong> This is an AI-assisted recommendation. Human arbitrators should review all evidence independently and can override this decision. The AI analysis is meant to assist, not replace, human judgment.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
