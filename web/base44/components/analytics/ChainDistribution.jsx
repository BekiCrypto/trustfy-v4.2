import React, { useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link2 } from "lucide-react";

const CHAIN_COLORS = {
  BSC: '#F3BA2F',
  Polygon: '#8247E5',
  Arbitrum: '#28A0F0',
  Optimism: '#FF0420'
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
      <p className="text-white font-semibold">{payload[0].payload.chain}</p>
      <p className="text-slate-400 text-sm">
        {payload[0].value} trades
      </p>
      <p className="text-slate-500 text-xs">
        ${payload[0].payload.volume?.toLocaleString()}
      </p>
    </div>
  );
};

export default function ChainDistribution({ trades = [] }) {
  const chartData = useMemo(() => {
    const chainStats = {};
    
    trades.forEach(trade => {
      const chain = trade.chain || 'BSC';
      if (!chainStats[chain]) {
        chainStats[chain] = { trades: 0, volume: 0 };
      }
      chainStats[chain].trades += 1;
      chainStats[chain].volume += trade.amount || 0;
    });
    
    return Object.entries(chainStats)
      .map(([chain, stats]) => ({
        chain,
        trades: stats.trades,
        volume: Math.round(stats.volume),
        fill: CHAIN_COLORS[chain] || '#64748b'
      }))
      .sort((a, b) => b.trades - a.trades);
  }, [trades]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Link2 className="w-5 h-5 text-purple-400" />
              Chain Distribution
            </h3>
            <p className="text-sm text-slate-400 mt-1">Trades per blockchain</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis 
              dataKey="chain" 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="trades" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}