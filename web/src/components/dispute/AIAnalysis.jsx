import React, { useState } from 'react';
import { useTranslation } from "@/hooks/useTranslation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Bot, 
  CheckCircle, 
  XCircle, 
  Scale, 
  AlertTriangle,
  TrendingUp,
  FileText,
  MessageSquare,
  Loader2
} from "lucide-react";

export default function AIAnalysis({ analysis, onAccept, onContest, isProcessing }) {
  const { t } = useTranslation();
  if (!analysis) return null;

  const confidenceLevels = {
    high: { label: t('dispute.aiAnalysis.confidence.high'), color: 'text-emerald-400', bg: 'bg-emerald-500/10', threshold: 80 },
    medium: { label: t('dispute.aiAnalysis.confidence.medium'), color: 'text-amber-400', bg: 'bg-amber-500/10', threshold: 60 },
    low: { label: t('dispute.aiAnalysis.confidence.low'), color: 'text-red-400', bg: 'bg-red-500/10', threshold: 0 }
  };

  const getConfidenceLevel = (score) => {
    if (score >= 80) return confidenceLevels.high;
    if (score >= 60) return confidenceLevels.medium;
    return confidenceLevels.low;
  };

  const confidence = getConfidenceLevel(analysis.confidence_score);
  const Icon = analysis.suggested_ruling === 'favor_seller' ? CheckCircle : 
                analysis.suggested_ruling === 'favor_buyer' ? XCircle : Scale;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 backdrop-blur-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
            <Bot className="w-6 h-6 text-purple-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white">{t('dispute.aiAnalysis.title')}</h3>
              <Badge className={`${confidence.bg} ${confidence.color} border border-current`}>
                {confidence.label}
              </Badge>
            </div>
            <p className="text-sm text-slate-400">
              {t('dispute.aiAnalysis.subtitle')}
            </p>
          </div>
        </div>
        
        {/* Suggested Ruling */}
        <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <Icon className={`w-6 h-6 ${
              analysis.suggested_ruling === 'favor_seller' ? 'text-emerald-400' :
              analysis.suggested_ruling === 'favor_buyer' ? 'text-blue-400' :
              'text-purple-400'
            }`} />
            <div>
              <p className="text-sm text-slate-400">{t('dispute.aiAnalysis.suggestedResolution')}</p>
              <p className="text-lg font-semibold text-white capitalize">
                {analysis.suggested_ruling.replace('_', ' ')}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-slate-400">{t('dispute.aiAnalysis.confidenceLabel')}</p>
              <p className="text-2xl font-bold text-white">{analysis.confidence_score}%</p>
            </div>
          </div>
        </div>
        
        {/* Reasoning */}
        <div className="mb-6 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-400 mb-3">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">{t('dispute.aiAnalysis.reasoning')}</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{analysis.reasoning}</p>
        </div>
        
        {/* Analysis Factors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <MessageSquare className="w-3 h-3" />
              {t('dispute.aiAnalysis.chatAnalysis')}
            </div>
            <p className="text-sm font-semibold text-white">
              {analysis.factors?.chat_sentiment || t('dispute.aiAnalysis.defaults.neutral')}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <FileText className="w-3 h-3" />
              {t('dispute.aiAnalysis.evidenceQuality')}
            </div>
            <p className="text-sm font-semibold text-white">
              {analysis.factors?.evidence_quality || t('dispute.aiAnalysis.defaults.moderate')}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              {t('dispute.aiAnalysis.patternMatch')}
            </div>
            <p className="text-sm font-semibold text-white">
              {analysis.factors?.pattern_confidence || t('dispute.aiAnalysis.defaults.high')}
            </p>
          </div>
        </div>
        
        {/* Key Points */}
        {analysis.key_points?.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-400 mb-3">{t('dispute.aiAnalysis.keyFindings')}</p>
            <ul className="space-y-2">
              {analysis.key_points.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
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
            {t('dispute.aiAnalysis.accept')}
          </Button>
          
          <Button
            onClick={onContest}
            disabled={isProcessing}
            variant="outline"
            className="flex-1 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {t('dispute.aiAnalysis.contest')}
          </Button>
        </div>
        
        <p className="text-xs text-slate-500 text-center mt-4">
          {t('dispute.aiAnalysis.contestNote')}
        </p>
      </Card>
    </motion.div>
  );
}
