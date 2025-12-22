import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  TrendingUp, 
  Award, 
  Crown, 
  Sparkles,
  ShieldAlert 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const tierConfig = {
  new: {
    label: 'New',
    icon: ShieldAlert,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    minScore: 0
  },
  bronze: {
    label: 'Bronze',
    icon: Star,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    minScore: 400
  },
  silver: {
    label: 'Silver',
    icon: TrendingUp,
    color: 'text-slate-300',
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/30',
    minScore: 600
  },
  gold: {
    label: 'Gold',
    icon: Award,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    minScore: 750
  },
  platinum: {
    label: 'Platinum',
    icon: Crown,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    minScore: 900
  }
};

export default function ReputationBadge({ 
  profile, 
  showScore = true, 
  showStats = false,
  size = 'default'
}) {
  if (!profile) return null;
  
  const tier = profile.reputation_tier || 'new';
  const score = profile.reputation_score || 500;
  const config = tierConfig[tier] || tierConfig.new;
  const Icon = config.icon;
  
  const successRate = profile.total_trades > 0 
    ? ((profile.successful_trades / profile.total_trades) * 100).toFixed(0)
    : 0;
  
  const BadgeContent = (
    <Badge 
      className={`${config.bg} ${config.border} ${config.color} border font-medium ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      }`}
    >
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
      {config.label}
      {showScore && <span className="ml-1">({score})</span>}
    </Badge>
  );
  
  if (!showStats) {
    return BadgeContent;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {BadgeContent}
        </TooltipTrigger>
        <TooltipContent className="bg-slate-800 border-slate-700 p-4 max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs">Reputation Score</span>
              <span className={`font-bold ${config.color}`}>{score}/1000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs">Success Rate</span>
              <span className="text-white text-sm">{successRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs">Total Trades</span>
              <span className="text-white text-sm">{profile.total_trades}</span>
            </div>
            {profile.positive_ratings > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Positive Ratings</span>
                <span className="text-emerald-400 text-sm">{profile.positive_ratings}</span>
              </div>
            )}
            {profile.maker_fee_discount > 0 && (
              <div className="pt-2 border-t border-slate-700">
                <div className="flex items-center gap-1 text-emerald-400 text-xs">
                  <Sparkles className="w-3 h-3" />
                  <span>Trust benefits active</span>
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
