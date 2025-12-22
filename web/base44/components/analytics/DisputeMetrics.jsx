import React, { useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { AlertTriangle, Scale, Bot, Gavel, Users } from "lucide-react";

export default function DisputeMetrics({ trades = [], disputes = [] }) {
  const metrics = useMemo(() => {
    const total = disputes.length;
    const resolved = disputes.filter(d => d.status === 'resolved').length;
    const pending = disputes.filter(d => d.status === 'pending' || d.status === 'automated_review').length;
    const escalated = disputes.filter(d => d.escalation_level >= 2).length;
    
    // Resolution by tier
    const tier1 = disputes.filter(d => d.escalation_level === 1 && d.status === 'resolved').length;
    const tier2 = disputes.filter(d => d.escalation_level === 2 && d.status === 'resolved').length;
    const tier3 = disputes.filter(d => d.escalation_level === 3 && d.status === 'resolved').length;
    
    // Rulings
    const favorSeller = disputes.filter(d => d.ruling === 'favor_seller').length;
    const favorBuyer = disputes.filter(d => d.ruling === 'favor_buyer').length;
    const split = disputes.filter(d => d.ruling === 'split').length;
    
    const disputeRate = trades.length > 0 ? ((total / trades.length) * 100).toFixed(1) : 0;
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;
    
    return {
      total,
      resolved,
      pending,
      escalated,
      tier1,
      tier2,
      tier3,
      favorSeller,
      favorBuyer,
      split,
      disputeRate,
      resolutionRate
    };
  }, [trades, disputes]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Dispute Analytics
            </h3>
            <p className="text-sm text-slate-400 mt-1">Resolution rates and outcomes</p>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-1">Total Disputes</p>
            <p className="text-2xl font-bold text-white">{metrics.total}</p>
            <p className="text-xs text-slate-500 mt-1">{metrics.disputeRate}% of trades</p>
          </div>
          
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-1">Resolved</p>
            <p className="text-2xl font-bold text-emerald-400">{metrics.resolved}</p>
            <p className="text-xs text-slate-500 mt-1">{metrics.resolutionRate}% rate</p>
          </div>
          
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-1">Pending</p>
            <p className="text-2xl font-bold text-amber-400">{metrics.pending}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-1">Escalated</p>
            <p className="text-2xl font-bold text-orange-400">{metrics.escalated}</p>
          </div>
        </div>
        
        {/* Resolution by Tier */}
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-400 mb-3">Resolution by Tier</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-violet-500/10 border border-violet-500/30">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-white">Tier 1 (AI Review)</span>
              </div>
              <Badge className="bg-violet-500/20 text-violet-400">{metrics.tier1}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <div className="flex items-center gap-2">
                <Gavel className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-white">Tier 2 (AI Arbitration)</span>
              </div>
              <Badge className="bg-orange-500/20 text-orange-400">{metrics.tier2}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white">Tier 3 (DAO Vote)</span>
              </div>
              <Badge className="bg-purple-500/20 text-purple-400">{metrics.tier3}</Badge>
            </div>
          </div>
        </div>
        
        {/* Ruling Outcomes */}
        <div>
          <p className="text-sm font-medium text-slate-400 mb-3">Ruling Distribution</p>
          <div className="flex gap-2">
            <div className="flex-1 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
              <p className="text-xs text-emerald-400 mb-1">Favor Seller</p>
              <p className="text-lg font-bold text-white">{metrics.favorSeller}</p>
            </div>
            <div className="flex-1 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
              <p className="text-xs text-blue-400 mb-1">Favor Buyer</p>
              <p className="text-lg font-bold text-white">{metrics.favorBuyer}</p>
            </div>
            <div className="flex-1 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-center">
              <p className="text-xs text-purple-400 mb-1">Split</p>
              <p className="text-lg font-bold text-white">{metrics.split}</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}