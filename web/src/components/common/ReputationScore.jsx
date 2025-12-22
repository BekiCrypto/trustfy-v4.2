import React from 'react';
import { Progress } from "@/components/ui/progress";

export default function ReputationScore({ profile, compact = false }) {
  if (!profile) return null;
  
  const score = profile.reputation_score || 500;
  const percentage = (score / 1000) * 100;
  
  const getScoreColor = (score) => {
    if (score >= 900) return 'text-cyan-400';
    if (score >= 750) return 'text-yellow-400';
    if (score >= 600) return 'text-slate-300';
    if (score >= 400) return 'text-amber-600';
    return 'text-slate-400';
  };
  
  const getProgressColor = (score) => {
    if (score >= 900) return 'bg-cyan-500';
    if (score >= 750) return 'bg-yellow-500';
    if (score >= 600) return 'bg-slate-400';
    if (score >= 400) return 'bg-amber-600';
    return 'bg-slate-500';
  };
  
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={`font-bold text-lg ${getScoreColor(score)}`}>
          {score}
        </span>
        <div className="flex-1 max-w-[100px]">
          <Progress 
            value={percentage} 
            className="h-1.5 bg-slate-700"
            indicatorClassName={getProgressColor(score)}
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">Reputation</span>
        <span className={`font-bold text-xl ${getScoreColor(score)}`}>
          {score}/1000
        </span>
      </div>
      <Progress 
        value={percentage} 
        className="h-2 bg-slate-700"
        indicatorClassName={getProgressColor(score)}
      />
    </div>
  );
}