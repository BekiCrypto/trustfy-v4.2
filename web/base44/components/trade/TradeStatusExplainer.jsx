import React from 'react';
import { Card } from "@/components/ui/card";
import { Shield, Lock, Unlock, CheckCircle2, AlertTriangle } from "lucide-react";

export default function TradeStatusExplainer({ status }) {
  const explanations = {
    pending: {
      icon: Lock,
      color: 'amber',
      title: 'CREATED - Awaiting Seller Funding',
      steps: [
        'Seller must deposit: Trade Amount + Fees + Seller Bond',
        'Buyer waits for seller to fund escrow',
        'Trade expires if seller doesn\'t fund within timeout'
      ]
    },
    funded: {
      icon: Shield,
      color: 'blue',
      title: 'FUNDED - Seller Bond Locked',
      steps: [
        '✓ Seller has deposited trade amount + fees + seller bond',
        'Buyer must now send fiat payment off-chain',
        'After sending fiat, buyer locks buyer bond to confirm payment',
        'Buyer bond = Seller bond (symmetric)'
      ]
    },
    in_progress: {
      icon: Shield,
      color: 'purple',
      title: 'IN_PROGRESS - Both Bonds Secured',
      steps: [
        '✓ Seller bond locked ✓ Buyer bond locked',
        'Fiat payment confirmed by buyer',
        'Seller verifies fiat receipt off-chain',
        'Seller releases crypto (both bonds refunded)',
        'Either party can dispute (loser forfeits bond)'
      ]
    },
    disputed: {
      icon: AlertTriangle,
      color: 'red',
      title: 'DISPUTED - Arbitration Active',
      steps: [
        'Both bonds are at stake',
        'Arbitrator reviews evidence',
        'Winner: Gets bond back',
        'Loser: Bond forfeited to platform as dispute fee',
        'Crypto always goes to buyer'
      ]
    },
    completed: {
      icon: CheckCircle2,
      color: 'emerald',
      title: 'COMPLETED - Trade Successful',
      steps: [
        '✓ Crypto released to buyer',
        '✓ Both bonds refunded',
        '✓ Seller received fiat payment',
        'Trade can now be rated'
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