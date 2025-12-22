import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, Clock, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatusBadge from "../common/StatusBadge";
import WalletAddress from "../common/WalletAddress";

const statusConfig = {
  pending: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Pending' },
  active: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Active' },
  expired: { color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Expired' },
  claimed: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Claimed' },
  cancelled: { color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Cancelled' }
};

export default function InsurancePolicyCard({ policy, index = 0 }) {
  const status = statusConfig[policy.status] || statusConfig.pending;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl p-5 hover:border-slate-600/50 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${status.bg}`}>
              <Shield className={`w-5 h-5 ${status.color}`} />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-mono text-sm text-slate-400">
                  {policy.policy_id?.slice(0, 16)}...
                </p>
                <div className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                  {status.label}
                </div>
              </div>
              
              {policy.auto_approved && (
                <div className="flex items-center gap-1 text-xs text-blue-400 mb-2">
                  <CheckCircle className="w-3 h-3" />
                  Auto-approved
                </div>
              )}
              
              <div className="text-sm text-slate-500">
                <span>Insured: </span>
                <WalletAddress address={policy.insured_address} />
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              ${policy.coverage_amount?.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Coverage</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
              <DollarSign className="w-3 h-3" />
              Premium
            </div>
            <p className="text-sm font-semibold text-white">
              ${policy.premium_amount?.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500">{policy.premium_rate}%</p>
          </div>
          
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
              <AlertCircle className="w-3 h-3" />
              Risk Score
            </div>
            <p className="text-sm font-semibold text-white">{policy.risk_score}</p>
            <p className="text-xs text-slate-500">
              {policy.risk_score < 30 ? 'Low' : policy.risk_score < 70 ? 'Medium' : 'High'}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
              <Clock className="w-3 h-3" />
              Duration
            </div>
            <p className="text-sm font-semibold text-white">
              {policy.end_date && policy.start_date 
                ? Math.round((new Date(policy.end_date) - new Date(policy.start_date)) / (1000 * 60 * 60 * 24))
                : 'N/A'}d
            </p>
          </div>
        </div>
        
        {policy.start_date && (
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
            <div>
              <span>Start: </span>
              <span className="text-slate-400">{format(new Date(policy.start_date), "MMM d, yyyy")}</span>
            </div>
            {policy.end_date && (
              <div>
                <span>End: </span>
                <span className="text-slate-400">{format(new Date(policy.end_date), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex gap-3">
          <Link to={createPageUrl(`TradeDetails?id=${policy.trade_id}`)} className="flex-1">
            <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
              View Trade
            </Button>
          </Link>
          
          {policy.claim_id && (
            <Link to={createPageUrl(`InsuranceClaimDetails?id=${policy.claim_id}`)}>
              <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                View Claim
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </motion.div>
  );
}