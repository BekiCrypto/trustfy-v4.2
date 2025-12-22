import React from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

const activityIcons = {
  trade_created: { icon: ArrowUpRight, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Trade Created' },
  trade_funded: { icon: ArrowDownLeft, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Seller Bond Locked' },
  trade_in_progress: { icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Both Bonds Locked' },
  trade_completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Completed' },
  dispute_opened: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Dispute Opened' },
  dispute_resolved: { icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Dispute Resolved' },
  trade_expired: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Trade Expired' },
  trade_cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Trade Cancelled' }
};

const generateMockActivity = (trades, disputes) => {
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
    activities.push({
      id: trade.id,
      type,
      description: `${config.label} - ${trade.amount} ${trade.token_symbol}`,
      amount: trade.amount,
      token: trade.token_symbol,
      timestamp: trade.updated_date || trade.created_date
    });
  });
  
  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export default function RecentActivity({ trades, disputes }) {
  const activities = generateMockActivity(trades, disputes);
  
  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No recent activity</p>
        ) : (
          activities.map((activity, index) => {
            const config = activityIcons[activity.type] || activityIcons.trade_created;
            const Icon = config.icon;
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate">{activity.description}</p>
                  <p className="text-xs text-slate-500">
                    {activity.timestamp && format(new Date(activity.timestamp), "MMM d, HH:mm")}
                  </p>
                </div>
                
                {activity.amount && (
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      {activity.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">{activity.token}</p>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </Card>
  );
}