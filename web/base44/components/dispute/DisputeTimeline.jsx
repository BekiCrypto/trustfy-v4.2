import React from 'react';
import { Card } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle, Scale, Users } from "lucide-react";
import { format, differenceInHours, addHours } from "date-fns";

const DISPUTE_STAGES = [
  {
    key: 'opened',
    label: 'Dispute Opened',
    icon: AlertTriangle,
    color: 'text-amber-400',
    maxHours: 0
  },
  {
    key: 'automated_review',
    label: 'Automated Review',
    icon: Clock,
    color: 'text-blue-400',
    maxHours: 2
  },
  {
    key: 'arbitration',
    label: 'Human Arbitration',
    icon: Scale,
    color: 'text-purple-400',
    maxHours: 24
  },
  {
    key: 'dao_vote',
    label: 'DAO Vote (if needed)',
    icon: Users,
    color: 'text-pink-400',
    maxHours: 72
  },
  {
    key: 'resolved',
    label: 'Resolved',
    icon: CheckCircle,
    color: 'text-emerald-400',
    maxHours: null
  }
];

export default function DisputeTimeline({ dispute }) {
  const getCurrentStageIndex = () => {
    if (dispute.status === 'resolved') return 4;
    if (dispute.status === 'dao_vote') return 3;
    if (dispute.status === 'arbitration') return 2;
    if (dispute.status === 'automated_review') return 1;
    return 0;
  };

  const currentStageIndex = getCurrentStageIndex();
  const createdAt = new Date(dispute.created_date);

  const getStageDeadline = (stageIndex) => {
    let totalHours = 0;
    for (let i = 0; i <= stageIndex; i++) {
      if (DISPUTE_STAGES[i].maxHours) {
        totalHours += DISPUTE_STAGES[i].maxHours;
      }
    }
    return addHours(createdAt, totalHours);
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const hoursRemaining = differenceInHours(deadline, now);
    
    if (hoursRemaining < 0) return 'Overdue';
    if (hoursRemaining < 1) return `${Math.round((deadline - now) / (1000 * 60))}m remaining`;
    if (hoursRemaining < 24) return `${hoursRemaining}h remaining`;
    return `${Math.round(hoursRemaining / 24)}d remaining`;
  };

  return (
    <Card className="bg-slate-900/90 border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-400" />
        Resolution Timeline
      </h3>

      <div className="space-y-6">
        {DISPUTE_STAGES.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isUpcoming = index > currentStageIndex;
          const Icon = stage.icon;
          const deadline = stage.maxHours ? getStageDeadline(index) : null;

          return (
            <div key={stage.key} className="flex gap-4">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  isCompleted 
                    ? 'bg-emerald-500/20 border-emerald-500' 
                    : isCurrent 
                    ? 'bg-blue-500/20 border-blue-500 animate-pulse' 
                    : 'bg-slate-800 border-slate-700'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isCompleted 
                      ? 'text-emerald-400' 
                      : isCurrent 
                      ? stage.color 
                      : 'text-slate-600'
                  }`} />
                </div>
                {index < DISPUTE_STAGES.length - 1 && (
                  <div className={`w-0.5 h-16 ${
                    isCompleted ? 'bg-emerald-500/30' : 'bg-slate-700'
                  }`} />
                )}
              </div>

              {/* Stage Details */}
              <div className="flex-1 pb-6">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-semibold ${
                    isCompleted 
                      ? 'text-emerald-400' 
                      : isCurrent 
                      ? 'text-white' 
                      : 'text-slate-500'
                  }`}>
                    {stage.label}
                  </h4>
                  {isCompleted && (
                    <span className="text-xs text-emerald-400">✓ Complete</span>
                  )}
                </div>

                {isCurrent && deadline && (
                  <div className="mt-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <p className="text-xs text-blue-400">
                      ⏱ {getTimeRemaining(deadline)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Deadline: {format(deadline, 'MMM d, HH:mm')}
                    </p>
                  </div>
                )}

                {isUpcoming && stage.maxHours && (
                  <p className="text-xs text-slate-500 mt-1">
                    Max duration: {stage.maxHours}h
                  </p>
                )}

                {/* Stage descriptions */}
                <p className="text-xs text-slate-400 mt-2">
                  {stage.key === 'opened' && 'Dispute initiated by one party. Funds are locked in escrow.'}
                  {stage.key === 'automated_review' && 'AI analyzes evidence and chat history. Low-risk disputes may be auto-resolved.'}
                  {stage.key === 'arbitration' && 'Assigned arbitrator reviews all evidence and makes a ruling.'}
                  {stage.key === 'dao_vote' && 'Complex cases escalated to community vote for final decision.'}
                  {stage.key === 'resolved' && 'Dispute closed. Funds released according to ruling.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-slate-700 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500">Total Time Elapsed</p>
          <p className="text-sm font-semibold text-white">
            {differenceInHours(new Date(), createdAt)}h
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Escalation Level</p>
          <p className="text-sm font-semibold text-white">
            Level {dispute.escalation_level}/3
          </p>
        </div>
      </div>
    </Card>
  );
}