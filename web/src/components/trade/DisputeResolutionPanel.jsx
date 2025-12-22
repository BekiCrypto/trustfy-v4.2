import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  ExternalLink,
  Scale
} from "lucide-react";
import { format } from "date-fns";
import WalletAddress from "../common/WalletAddress";
import { EXPLORERS } from "../web3/contractABI";

export default function DisputeResolutionPanel({ dispute, trade, bondAmount }) {
  if (!dispute) return null;

  const isResolved = dispute.status === 'resolved';
  const ruling = dispute.ruling;

  const getRulingDisplay = () => {
    if (!isResolved || ruling === 'pending') {
      return {
        icon: Scale,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        label: 'Arbitration Pending',
        description: 'Awaiting arbitrator decision (one dispute per escrow)'
      };
    }

    if (ruling === 'favor_buyer') {
      return {
        icon: TrendingDown,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        label: 'Buyer Wins',
        description: 'Buyer DisputeBond refunded; seller DisputeBond forfeited to Treasury'
      };
    }

    if (ruling === 'favor_seller') {
      return {
        icon: TrendingUp,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        label: 'Seller Wins',
        description: 'Seller DisputeBond refunded; buyer DisputeBond forfeited to Treasury'
      };
    }

    return {
      icon: AlertTriangle,
      color: 'text-slate-400',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/30',
      label: 'Unknown',
      description: 'Status unclear'
    };
  };

  const rulingDisplay = getRulingDisplay();
  const Icon = rulingDisplay.icon;

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${rulingDisplay.bg} ${rulingDisplay.border} border`}>
            <Icon className={`w-5 h-5 ${rulingDisplay.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Dispute Resolution</h3>
            <p className="text-slate-400 text-xs">Case ID: {dispute.id}</p>
          </div>
        </div>
        <Badge className={`${rulingDisplay.bg} ${rulingDisplay.color} ${rulingDisplay.border}`}>
          {rulingDisplay.label}
        </Badge>
      </div>

      {/* Dispute Details */}
      <div className="space-y-4">
        {/* Initiator */}
        <div className="p-3 rounded-lg bg-slate-800/50">
          <p className="text-slate-400 text-xs mb-1">Initiated By</p>
          <WalletAddress address={dispute.initiator_address} />
          <p className="text-xs text-slate-500 mt-1">
            {format(new Date(dispute.created_date), 'MMM d, yyyy HH:mm')}
          </p>
        </div>

        {/* Reason */}
        <div className="p-3 rounded-lg bg-slate-800/50">
          <p className="text-slate-400 text-xs mb-2">Dispute Reason</p>
          <p className="text-white text-sm">{dispute.reason || 'No reason provided'}</p>
        </div>

        {/* Financial Stakes */}
        {bondAmount && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-red-400" />
            <h4 className="text-sm font-semibold text-red-400">DisputeBond at Risk</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Seller DisputeBond:</span>
                <span className="text-white font-semibold">{bondAmount} {trade.token_symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Buyer DisputeBond:</span>
                <span className="text-white font-semibold">{bondAmount} {trade.token_symbol}</span>
              </div>
              <div className="h-px bg-red-500/30 my-2" />
              <div className="flex justify-between text-red-300 font-bold">
                <span>Total at Stake:</span>
                <span>{(parseFloat(bondAmount) * 2).toFixed(4)} {trade.token_symbol}</span>
              </div>
            </div>
          </div>
        )}

        {/* Arbitrator */}
        {dispute.arbitrator_address && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-blue-400 text-xs mb-1">Assigned Arbitrator</p>
            <WalletAddress address={dispute.arbitrator_address} />
          </div>
        )}

        {/* Ruling Details */}
        {isResolved && ruling !== 'pending' && (
          <div className={`p-4 rounded-lg ${rulingDisplay.bg} border ${rulingDisplay.border}`}>
            <h4 className={`text-sm font-semibold ${rulingDisplay.color} mb-2`}>
              Final Decision
            </h4>
            <p className="text-white text-sm mb-3">{rulingDisplay.description}</p>
            
            {/* Payout Breakdown */}
            <div className="space-y-2 text-xs">
              {ruling === 'favor_buyer' && (
                <>
                  <div className="flex justify-between text-emerald-300">
                    <span>→ Buyer receives:</span>
                    <span className="font-bold">DisputeBond refund</span>
                  </div>
                  <div className="flex justify-between text-red-300">
                    <span>→ Seller forfeits:</span>
                    <span className="font-bold">DisputeBond to Treasury</span>
                  </div>
                </>
              )}
              {ruling === 'favor_seller' && (
                <>
                  <div className="flex justify-between text-blue-300">
                    <span>→ Seller receives:</span>
                    <span className="font-bold">DisputeBond refund</span>
                  </div>
                  <div className="flex justify-between text-red-300">
                    <span>→ Buyer forfeits:</span>
                    <span className="font-bold">DisputeBond to Treasury</span>
                  </div>
                </>
              )}
            </div>

            {dispute.resolved_at && (
              <p className="text-slate-400 text-xs mt-3 pt-3 border-t border-slate-700/50">
                Resolved: {format(new Date(dispute.resolved_at), 'MMM d, yyyy HH:mm')}
              </p>
            )}
          </div>
        )}

        {/* View on Explorer */}
        {trade.tx_hash && (
          <a
            href={`${EXPLORERS[trade.chain]}/tx/${trade.tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-blue-400 hover:text-blue-300 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            View Transaction on Explorer
          </a>
        )}

        {/* Explanation */}
        {!isResolved && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-amber-300 text-xs">
              <strong>How This Works:</strong><br />
              The arbitrator reviews evidence and the escrow timeline. The ruling decides DisputeBond refunds/forfeits and resolves the escrow on-chain.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
