import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle } from "lucide-react";
import { TIER_BENEFITS, getNextTier, getTierProgress } from './TierConfig';
import TierBadge from './TierBadge';

export default function TierProgress({ profile, currentTier }) {
  const { t } = useTranslation();
  const nextTier = getNextTier(currentTier);
  const { progress, requirements } = getTierProgress(profile, currentTier);
  
  if (!nextTier) {
    return (
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 p-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-cyan-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">{t('tierNames.platinum')}</h3>
            <p className="text-slate-400 text-sm">{t('cards.tier.yourCurrentTier')}</p>
          </div>
        </div>
      </Card>
    );
  }
  
  const nextConfig = TIER_BENEFITS[nextTier];
  
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <TierBadge tier={currentTier} />
        <ArrowRight className="w-5 h-5 text-slate-600" />
        <TierBadge tier={nextTier} />
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-slate-400">{t('tiers.progress')} {t(nextConfig.name)}</p>
          <p className="text-sm font-semibold text-white">{Math.round(progress)}%</p>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-300">{t('tiers.requirements')}:</p>
        {requirements.map((req, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{t(req.label)}</span>
              <span className={req.current >= req.required ? 'text-emerald-400' : 'text-slate-300'}>
                {req.label === 'tiersPage.tradingVolumeLabel' ? '$' : ''}{req.current.toLocaleString()} / {req.label === 'tiersPage.tradingVolumeLabel' ? '$' : ''}{req.required.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={req.progress} 
              className={`h-1.5 ${req.current >= req.required ? '[&>div]:bg-emerald-500' : ''}`}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}