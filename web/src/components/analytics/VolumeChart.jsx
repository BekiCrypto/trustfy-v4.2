import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from "lucide-react";

const CustomTooltip = ({ active, payload, t }) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
      <p className="text-slate-400 text-xs mb-1">{payload[0].payload.date}</p>
      <p className="text-white font-semibold">
        ${payload[0].value?.toLocaleString()}
      </p>
      <p className="text-slate-400 text-xs">
        {payload[0].payload.count} {t('dashboard.trades')}
      </p>
    </div>
  );
};

export default function VolumeChart({ trades = [], timeRange = '30' }) {
  const { t } = useTranslation();
  const chartData = useMemo(() => {
    const days = parseInt(timeRange) === 99999 ? 365 : parseInt(timeRange);
    const data = [];
    const now = new Date();
    
    // Generate data points based on time range
    const interval = days > 90 ? 7 : days > 30 ? 3 : 1; // Weekly for 90+, every 3 days for 30-90, daily otherwise
    
    for (let i = days; i >= 0; i -= interval) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.created_date).toISOString().split('T')[0];
        return tradeDate === dateStr;
      });
      
      const volume = dayTrades.reduce((sum, trade) => sum + (trade.amount || 0), 0);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: Math.round(volume),
        count: dayTrades.length
      });
    }
    
    return data;
  }, [trades, timeRange]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              {t('analytics.volumeChart')}
            </h3>
            <p className="text-sm text-slate-400 mt-1">{t('analytics.tradingVolume')}</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip t={t} />} />
            <Area 
              type="monotone" 
              dataKey="volume" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#volumeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}
