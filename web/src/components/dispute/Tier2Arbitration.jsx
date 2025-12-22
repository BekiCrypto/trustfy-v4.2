import React from 'react';
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Gavel, 
  CheckCircle, 
  XCircle, 
  Scale, 
  AlertTriangle,
  Shield,
  FileText,
  MessageSquare,
  Loader2,
  TrendingUp,
  Users
} from "lucide-react";

export default function Tier2Arbitration({ analysis, onAccept, onEscalateToDAO, isProcessing }) {
  const { t } = useTranslation();
  if (!analysis) return null;

  const confidenceLevels = {
    high: { label: t('dispute.tier2.confidence.high'), color: 'text-emerald-400', bg: 'bg-emerald-500/10', threshold: 85 },
    medium: { label: t('dispute.tier2.confidence.medium'), color: 'text-amber-400', bg: 'bg-amber-500/10', threshold: 70 },
    low: { label: t('dispute.tier2.confidence.low'), color: 'text-orange-400', bg: 'bg-orange-500/10', threshold: 0 }
  };

  const getConfidenceLevel = (score) => {
    if (score >= 85) return confidenceLevels.high;
    if (score >= 70) return confidenceLevels.medium;
    return confidenceLevels.low;
  };

  const confidence = getConfidenceLevel(analysis.confidence_score);
  const Icon = analysis.final_ruling === 'favor_seller' ? CheckCircle : 
                analysis.final_ruling === 'favor_buyer' ? XCircle : Scale;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/30 backdrop-blur-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-xl bg-orange-500/20 border border-orange-500/30">
            <Gavel className="w-6 h-6 text-orange-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white">{t('dispute.tier2.title')}</h3>
              <Badge className={`${confidence.bg} ${confidence.color} border border-current`}>
                {confidence.label}
              </Badge>
            </div>
            <p className="text-sm text-slate-400">
              {t('dispute.tier2.subtitle')}
            </p>
          </div>
        </div>
        
        {/* Previous Ruling Review */}
        {analysis.tier1_review && (
          <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">{t('dispute.tier2.tier1Review')}</span>
            </div>
            <p className="text-sm text-slate-300">{analysis.tier1_review}</p>
          </div>
        )}
        
        {/* Final Ruling */}
        <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <Icon className={`w-6 h-6 ${
              analysis.final_ruling === 'favor_seller' ? 'text-emerald-400' :
              analysis.final_ruling === 'favor_buyer' ? 'text-blue-400' :
              'text-purple-400'
            }`} />
            <div className="flex-1">
              <p className="text-sm text-slate-400">{t('dispute.tier2.finalDecision')}</p>
              <p className="text-xl font-semibold text-white capitalize">
                {analysis.final_ruling.replace('_', ' ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">{t('dispute.tier2.confidenceLabel')}</p>
              <p className="text-2xl font-bold text-white">{analysis.confidence_score}%</p>
            </div>
          </div>
        </div>
        
        {/* Detailed Reasoning */}
        <div className="mb-6 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-400 mb-3">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">{t('dispute.tier2.reasoning')}</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">{analysis.reasoning}</p>
          
          {analysis.contestation_addressed && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <p className="text-xs text-slate-400 mb-2">{t('dispute.tier2.contestation')}</p>
              <p className="text-sm text-slate-300">{analysis.contestation_addressed}</p>
            </div>
          )}
        </div>
        
        {/* Analysis Factors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <MessageSquare className="w-3 h-3" />
              {t('dispute.tier2.evidenceStrength')}
            </div>
            <p className="text-sm font-semibold text-white">
              {analysis.factors?.evidence_strength || t('dispute.tier2.defaults.strong')}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Scale className="w-3 h-3" />
              {t('dispute.tier2.fairnessScore')}
            </div>
            <p className="text-sm font-semibold text-white">
              {analysis.factors?.fairness_score || t('dispute.tier2.defaults.fairnessScore')}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              {t('dispute.tier2.legalPrecedent')}
            </div>
            <p className="text-sm font-semibold text-white">
              {analysis.factors?.precedent_match || t('dispute.tier2.defaults.high')}
            </p>
          </div>
        </div>
        
        {/* Key Findings */}
        {analysis.key_findings?.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-400 mb-3">{t('dispute.tier2.keyFindings')}</p>
            <ul className="space-y-2">
              {analysis.key_findings.map((finding, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Risk Assessment */}
        {analysis.risk_assessment && (
          <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{t('dispute.tier2.riskAssessment')}</span>
            </div>
            <p className="text-xs text-slate-300">{analysis.risk_assessment}</p>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
          <Button
            onClick={onAccept}
            disabled={isProcessing}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            {t('dispute.tier2.accept')}
          </Button>
          
          <Button
            onClick={onEscalateToDAO}
            disabled={isProcessing}
            variant="outline"
            className="flex-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
          >
            <Users className="w-4 h-4 mr-2" />
            {t('dispute.tier2.escalate')}
          </Button>
        </div>
        
        <p className="text-xs text-slate-500 text-center mt-4">
          {t('dispute.tier2.escalateNote')}
        </p>
      </Card>
    </motion.div>
  );
}
