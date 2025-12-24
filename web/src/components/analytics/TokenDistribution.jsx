import React, { useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Coins } from "lucide-react";

const COLORS = {
  USDT: '#26A17B',
  USDC: '#2775CA',
  BTC: '#F7931A',
  ETH: '#627EEA',
  BNB: '#F3BA2F',
  MATIC: '#8247E5'
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
      <p className="text-white font-semibold">{payload[0].name}</p>
      <p className="text-slate-400 text-sm">
        ${payload[0].value?.toLocaleString()}
      </p>
      <p className="text-slate-500 text-xs">
        {payload[0].payload.percentage}%
      </p>
    </div>
  );
};

export default function TokenDistribution({ trades = [] }) {
  const { t } = useTranslation();
  const chartData = useMemo(() => {
    const tokenVolumes = {};
    let totalVolume = 0;
    
    trades.forEach(trade => {
      const token = trade.token_symbol || 'USDT';
      tokenVolumes[token] = (tokenVolumes[token] || 0) + (trade.amount || 0);
      totalVolume += trade.amount || 0;
    });
    
    return Object.entries(tokenVolumes)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        percentage: ((value / totalVolume) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value);
  }, [trades]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              {t('analytics.tokenDistribution')}
            </h3>
            <p className="text-sm text-slate-400 mt-1">{t('analytics.tradingVolume')}</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#64748b'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => (
                <span className="text-slate-300 text-sm">
                  {value} ({entry.payload.percentage}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}
