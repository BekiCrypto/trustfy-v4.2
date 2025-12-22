import React from 'react';
import { Card } from "@/components/ui/card";
import { Shield, Lock, Unlock, CheckCircle2, AlertTriangle } from "lucide-react";

export default function TradeStatusExplainer({ status }) {
  const explanations = {
    pending: {
      icon: Lock,
      color: 'amber',
      title: 'TAKEN - Awaiting Seller Funding',
      steps: [
        'Ad is taken and Escrow is created',
        'Buyer DisputeBond is locked at take',
        'Seller must fund the escrow within the funding window'
      ]
    },
    funded: {
      icon: Shield,
      color: 'blue',
      title: 'FUNDED - Awaiting Buyer Payment Confirmation',
      steps: [
        'Seller funded escrow (amount + fees + Seller DisputeBond)',
        'Buyer sends fiat payment off-chain',
        'Buyer confirms payment within the time window'
      ]
    },
    in_progress: {
      icon: Shield,
      color: 'purple',
      title: 'PAYMENT_CONFIRMED - Awaiting Release',
      steps: [
        'Buyer confirmed payment on-chain',
        'Seller verifies fiat receipt',
        'Seller releases escrow to buyer',
        'Dispute is allowed only after PAYMENT_CONFIRMED (one per escrow)'
      ]
    },
    disputed: {
      icon: AlertTriangle,
      color: 'red',
      title: 'DISPUTED - Arbitration Active',
      steps: [
        'Arbitrator reviews evidence',
        'Loser forfeits DisputeBond to Treasury',
        'Winner DisputeBond is refunded',
        'Escrow is resolved based on the outcome'
      ]
    },
    completed: {
      icon: CheckCircle2,
      color: 'emerald',
      title: 'RESOLVED - Escrow Completed',
      steps: [
        'Escrow released to buyer on-chain',
        'AdBond is returned to the Maker credit wallet',
        'DisputeBonds are refunded when applicable'
      ]
    }
  };

  const config = explanations[status];
  if (!config) return null;

  const Icon = config.icon;
  const colorClasses = {
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    red: 'text-red-400 bg-red-500/10 border-red-500/30',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  };

  return (
    <Card className={`p-4 border ${colorClasses[config.color]}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${colorClasses[config.color].split(' ')[0]} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className={`font-semibold text-sm mb-2 ${colorClasses[config.color].split(' ')[0]}`}>
            {config.title}
          </h4>
          <ul className="space-y-1">
            {config.steps.map((step, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-slate-500">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
