import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { TIER_BENEFITS } from './TierConfig';

export default function TierCard({ tier, isCurrentTier = false }) {
  const { t } = useTranslation();
  const config = TIER_BENEFITS[tier];
  const Icon = config.icon;
  
  return (
    <Card className={`p-6 ${
      isCurrentTier 
        ? `bg-gradient-to-br ${config.color.replace('from-', 'from-')}/20 border-2 ${config.borderColor}` 
        : 'bg-slate-900/50 border-slate-700/50'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${config.color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className={`text-xl font-bold ${config.textColor}`}>{t(config.name)}</h3>
          {isCurrentTier && (
            <p className="text-xs text-slate-500">{t('cards.tier.yourCurrentTier')}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="text-sm text-slate-400">
          <span className="font-semibold">{t('cards.tier.requirements')}:</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded bg-slate-800/50">
            <p className="text-slate-500">{t('cards.tier.reputation')}</p>
            <p className="text-white font-semibold">{config.minReputation}+</p>
          </div>
          <div className="p-2 rounded bg-slate-800/50">
            <p className="text-slate-500">{t('cards.tier.trades')}</p>
            <p className="text-white font-semibold">{config.minTrades}+</p>
          </div>
          <div className="p-2 rounded bg-slate-800/50">
            <p className="text-slate-500">{t('cards.tier.volume')}</p>
            <p className="text-white font-semibold">${config.minVolume.toLocaleString()}+</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-300">{t('cards.tier.benefits')}:</p>
        <ul className="space-y-1.5">
          {config.perks.map((perk, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{t(perk)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}