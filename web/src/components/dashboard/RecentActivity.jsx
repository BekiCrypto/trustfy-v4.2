import React from 'react';
import { Card } from "@/components/ui/card";
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const activityIcons = {
  trade_created: { icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/10', labelKey: 'created' },
  trade_completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', labelKey: 'completed' },
  trade_cancelled: { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-500/10', labelKey: 'cancelled' },
  dispute_opened: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', labelKey: 'dispute' },
  trade_funded: { icon: ArrowUpRight, color: 'text-purple-400', bg: 'bg-purple-500/10', labelKey: 'funded' },
  trade_in_progress: { icon: ArrowDownLeft, color: 'text-amber-400', bg: 'bg-amber-500/10', labelKey: 'inProgress' },
  trade_expired: { icon: XCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', labelKey: 'expired' }
};

const generateActivity = (trades, disputes, t) => {
  const activities = [];
  
  trades?.slice(0, 5).forEach((trade) => {
    let type = 'trade_created';
    if (trade.status === 'completed') type = 'trade_completed';
    else if (trade.status === 'in_progress') type = 'trade_in_progress';
    else if (trade.status === 'funded') type = 'trade_funded';
    else if (trade.status === 'disputed') type = 'dispute_opened';
    else if (trade.status === 'expired') type = 'trade_expired';
    else if (trade.status === 'cancelled') type = 'trade_cancelled';
    
    const config = activityIcons[type];
    const label = t(`dashboard.recentActivity.labels.${config.labelKey}`);
    activities.push({
      id: trade.id,
      type,
      label,
      description: t('dashboard.recentActivity.description', {
        label,
        amount: trade.amount,
        token: trade.token_symbol
      }),
      amount: trade.amount,
      token: trade.token_symbol,
      timestamp: trade.updated_date || trade.created_date
    });
  });
  
  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export default function RecentActivity({ trades, disputes }) {
  const { t } = useTranslation();
  const activities = generateActivity(trades, disputes, t);
  
  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          {t('dashboard.recentActivity.title')}
        </h3>
        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
          {t('dashboard.recentActivity.viewAll')}
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            {t('dashboard.recentActivity.noActivity')}
          </div>
        ) : (
          activities.map((activity) => {
            const config = activityIcons[activity.type] || activityIcons.trade_created;
            const Icon = config.icon;
            
            return (
              <div 
                key={activity.id} 
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800/50 transition-colors group cursor-default"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`p-2 rounded-full ${config.bg} cursor-help`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                    <p>{activity.label}</p>
                  </TooltipContent>
                </Tooltip>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate font-medium">
                    {activity.description}
                  </p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(activity.timestamp), 'MMM d, HH:mm')}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {activity.amount} <span className="text-xs text-slate-500">{activity.token}</span>
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
