import React from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, User, DollarSign, Shield } from "lucide-react";

export function calculateRiskScore(trade, userProfile, counterpartyProfile) {
  let score = 50; // Base score
  
  // User reputation factor (0-30 points)
  if (userProfile) {
    const repScore = userProfile.reputation_score || 500;
    if (repScore >= 900) score -= 20;
    else if (repScore >= 700) score -= 10;
    else if (repScore >= 500) score -= 5;
    else if (repScore < 300) score += 15;
  }
  
  // Counterparty reputation factor (0-20 points)
  if (counterpartyProfile) {
    const repScore = counterpartyProfile.reputation_score || 500;
    if (repScore >= 900) score -= 15;
    else if (repScore >= 700) score -= 8;
    else if (repScore >= 500) score -= 3;
    else if (repScore < 300) score += 10;
  }
  
  // Trade amount factor (0-20 points)
  if (trade.amount > 50000) score += 15;
  else if (trade.amount > 20000) score += 10;
  else if (trade.amount > 10000) score += 5;
  else if (trade.amount < 1000) score -= 5;
  
  // Chain risk factor (0-10 points)
  const chainRisk = {
    'BSC': 0,
    'Polygon': 2,
    'Arbitrum': 5,
    'Optimism': 5
  };
  score += chainRisk[trade.chain] || 5;
  
  // New user factor
  if (userProfile?.total_trades < 5) score += 10;
  
  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, score));
}

export function calculatePremium(coverageAmount, riskScore, basePremiumRate = 2.5) {
  // Base premium
  let rate = basePremiumRate;
  
  // Adjust based on risk score
  if (riskScore < 30) rate *= 0.8; // Low risk discount
  else if (riskScore < 50) rate *= 0.9;
  else if (riskScore > 70) rate *= 1.5; // High risk premium
  else if (riskScore > 80) rate *= 2.0;
  
  const premium = (coverageAmount * rate) / 100;
  return { premium, rate };
}

export default function RiskCalculator({ riskScore, riskFactors, premium }) {
  const getRiskLevel = () => {
    if (riskScore < 30) return { label: 'Low Risk', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (riskScore < 50) return { label: 'Moderate Risk', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (riskScore < 70) return { label: 'Medium Risk', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { label: 'High Risk', color: 'text-red-400', bg: 'bg-red-500/10' };
  };
  
  const level = getRiskLevel();
  
  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${level.bg}`}>
          <AlertTriangle className={`w-5 h-5 ${level.color}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
          <p className="text-sm text-slate-400">Calculated risk profile</p>
        </div>
      </div>
      
      {/* Risk Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${level.color}`}>{level.label}</span>
          <span className="text-2xl font-bold text-white">{riskScore}/100</span>
        </div>
        <Progress 
          value={riskScore} 
          className={`h-2 ${
            riskScore < 30 ? '[&>div]:bg-emerald-500' :
            riskScore < 50 ? '[&>div]:bg-blue-500' :
            riskScore < 70 ? '[&>div]:bg-amber-500' :
            '[&>div]:bg-red-500'
          }`}
        />
      </div>
      
      {/* Risk Factors */}
      {riskFactors && (
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-medium text-slate-400">Contributing Factors</h4>
          
          {riskFactors.user_reputation && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
              <User className="w-4 h-4 text-slate-500" />
              <div className="flex-1">
                <p className="text-sm text-slate-300">User Reputation</p>
                <p className="text-xs text-slate-500">Score: {riskFactors.user_reputation}</p>
              </div>
            </div>
          )}
          
          {riskFactors.counterparty_reputation && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
              <User className="w-4 h-4 text-slate-500" />
              <div className="flex-1">
                <p className="text-sm text-slate-300">Counterparty Reputation</p>
                <p className="text-xs text-slate-500">Score: {riskFactors.counterparty_reputation}</p>
              </div>
            </div>
          )}
          
          {riskFactors.trade_amount && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <div className="flex-1">
                <p className="text-sm text-slate-300">Trade Amount</p>
                <p className="text-xs text-slate-500">${riskFactors.trade_amount.toLocaleString()}</p>
              </div>
            </div>
          )}
          
          {riskFactors.chain_risk && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
              <Shield className="w-4 h-4 text-slate-500" />
              <div className="flex-1">
                <p className="text-sm text-slate-300">Chain Risk</p>
                <p className="text-xs text-slate-500">{riskFactors.chain_risk}</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Premium Estimate */}
      {premium && (
        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Estimated Premium</p>
              <p className="text-2xl font-bold text-white mt-1">
                ${premium.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      )}
    </Card>
  );
}