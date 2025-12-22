import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { useTranslation } from 'react-i18next';

const statusConfig = {
  pending: { 
    color: 'from-amber-500/20 to-amber-600/20', 
    border: 'border-amber-500/30', 
    text: 'text-amber-400', 
    label: 'CREATED',
    detail: 'Awaiting buyer to take escrow'
  },
  funded: { 
    color: 'from-blue-500/20 to-blue-600/20', 
    border: 'border-blue-500/30', 
    text: 'text-blue-400', 
    label: 'FUNDED',
    detail: 'Escrow funded by seller'
  },
  in_progress: { 
    color: 'from-purple-500/20 to-purple-600/20', 
    border: 'border-purple-500/30', 
    text: 'text-purple-400', 
    label: 'PAYMENT_CONFIRMED',
    detail: 'Buyer confirmed payment'
  },
  completed: { 
    color: 'from-emerald-500/20 to-emerald-600/20', 
    border: 'border-emerald-500/30', 
    text: 'text-emerald-400', 
    label: 'RESOLVED',
    detail: 'Escrow resolved'
  },
  disputed: { 
    color: 'from-red-500/20 to-red-600/20', 
    border: 'border-red-500/30', 
    text: 'text-red-400', 
    label: 'DISPUTED',
    detail: 'Dispute opened'
  },
  cancelled: { 
    color: 'from-slate-500/20 to-slate-600/20', 
    border: 'border-slate-500/30', 
    text: 'text-slate-400', 
    label: 'CANCELLED',
    detail: 'Escrow cancelled'
  },
  expired: { 
    color: 'from-gray-500/20 to-gray-600/20', 
    border: 'border-gray-500/30', 
    text: 'text-gray-400', 
    label: 'CANCELLED',
    detail: 'Escrow expired'
  },
  automated_review: { 
    color: 'from-violet-500/20 to-violet-600/20', 
    border: 'border-violet-500/30', 
    text: 'text-violet-400', 
    label: 'AI Review',
    detail: 'Tier 1 analysis'
  },
  arbitration: { 
    color: 'from-orange-500/20 to-orange-600/20', 
    border: 'border-orange-500/30', 
    text: 'text-orange-400', 
    label: 'Arbitration',
    detail: 'Tier 2 human review'
  },
  dao_vote: { 
    color: 'from-purple-500/20 to-purple-600/20', 
    border: 'border-purple-500/30', 
    text: 'text-purple-400', 
    label: 'DAO Vote',
    detail: 'Tier 3 governance'
  },
  resolved: { 
    color: 'from-green-500/20 to-green-600/20', 
    border: 'border-green-500/30', 
    text: 'text-green-400', 
    label: 'Resolved',
    detail: 'Dispute settled'
  },
  rejected: { 
    color: 'from-rose-500/20 to-rose-600/20', 
    border: 'border-rose-500/30', 
    text: 'text-rose-400', 
    label: 'Rejected',
    detail: 'Claim denied'
  }
};

export default function StatusBadge({ status, showDetail = false }) {
  const { t } = useTranslation();
  const config = statusConfig[status] || statusConfig.pending;
  
  const statusKey = status === 'in_progress' ? 'inProgress' : status;
  
  if (showDetail) {
    return (
      <div className={`bg-gradient-to-r ${config.color} ${config.border} border rounded-lg px-3 py-2`}>
        <p className={`font-semibold text-sm ${config.text}`}>
          {t(`status.${statusKey}`) || config.label}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{config.detail}</p>
      </div>
    );
  }
  
  return (
    <Badge className={`bg-gradient-to-r ${config.color} ${config.border} ${config.text} border font-medium text-xs flex items-center gap-1`}>
      <Activity className="w-3 h-3" />
      {t(`status.${statusKey}`) || config.label}
    </Badge>
  );
}
