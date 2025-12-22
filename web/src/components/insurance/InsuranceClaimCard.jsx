import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, DollarSign, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import WalletAddress from "../common/WalletAddress";

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Pending' },
  under_review: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Under Review' },
  approved: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Rejected' },
  paid: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Paid' }
};

const reasonLabels = {
  trade_failed: 'Trade Failed',
  dispute_lost: 'Dispute Lost',
  counterparty_default: 'Counterparty Default',
  fraud: 'Fraud',
  other: 'Other'
};

export default function InsuranceClaimCard({ claim, index = 0 }) {
  const status = statusConfig[claim.status] || statusConfig.pending;
  const Icon = status.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl p-5 hover:border-red-500/30 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${status.bg}`}>
              <Icon className={`w-5 h-5 ${status.color} ${claim.status === 'under_review' ? 'animate-spin' : ''}`} />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-mono text-sm text-slate-400">
                  {claim.claim_id?.slice(0, 16)}...
                </p>
                <div className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                  {status.label}
                </div>
              </div>
              
              {claim.auto_processed && (
                <div className="flex items-center gap-1 text-xs text-purple-400 mb-2">
                  <CheckCircle className="w-3 h-3" />
                  Auto-processed
                </div>
              )}
              
              <div className="text-sm text-slate-500 mb-1">
                <span>Claimant: </span>
                <WalletAddress address={claim.claimant_address} />
              </div>
              
              <div className="text-sm">
                <span className="text-slate-500">Reason: </span>
                <span className="text-slate-300">{reasonLabels[claim.claim_reason]}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              ${claim.claim_amount?.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Claimed</p>
          </div>
        </div>
        
        {claim.claim_description && (
          <div className="mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-sm text-slate-300">{claim.claim_description}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {claim.payout_amount > 0 && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-1 text-xs text-emerald-400 mb-1">
                <DollarSign className="w-3 h-3" />
                Payout
              </div>
              <p className="text-sm font-semibold text-white">
                ${claim.payout_amount?.toLocaleString()}
              </p>
            </div>
          )}
          
          {claim.processing_time_hours && (
            <div className="p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                <Clock className="w-3 h-3" />
                Processing Time
              </div>
              <p className="text-sm font-semibold text-white">
                {claim.processing_time_hours}h
              </p>
            </div>
          )}
          
          {claim.evidence_urls?.length > 0 && (
            <div className="p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                <AlertTriangle className="w-3 h-3" />
                Evidence
              </div>
              <p className="text-sm font-semibold text-white">
                {claim.evidence_urls.length} files
              </p>
            </div>
          )}
        </div>
        
        {claim.approval_reason && (
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs text-blue-400 mb-1">Review Notes</p>
            <p className="text-sm text-slate-300">{claim.approval_reason}</p>
          </div>
        )}
        
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <div>
            <span>Filed: </span>
            <span className="text-slate-400">
              {claim.created_date && format(new Date(claim.created_date), "MMM d, yyyy HH:mm")}
            </span>
          </div>
          
          {claim.paid_at && (
            <div>
              <span>Paid: </span>
              <span className="text-slate-400">
                {format(new Date(claim.paid_at), "MMM d, yyyy HH:mm")}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <Link to={createPageUrl(`TradeDetails?id=${claim.trade_id}`)} className="flex-1">
            <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
              View Trade
            </Button>
          </Link>
          
          {claim.dispute_id && (
            <Link to={createPageUrl(`DisputeDetails?id=${claim.dispute_id}`)}>
              <Button variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                View Dispute
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </motion.div>
  );
}