import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Clock, CheckCircle, AlertTriangle, TrendingUp, Target } from "lucide-react";

export default function ArbitratorStats({ 
  pendingCount, 
  resolvedCount, 
  totalAssigned,
  avgResolutionTime,
  rulingDistribution 
}) {
  const stats = [
    { 
      label: 'Pending Cases', 
      value: pendingCount, 
      icon: Clock, 
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      trend: pendingCount > 5 ? 'warning' : 'normal'
    },
    { 
      label: 'Resolved Cases', 
      value: resolvedCount, 
      icon: CheckCircle, 
      color: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      trend: 'positive'
    },
    { 
      label: 'Total Assigned', 
      value: totalAssigned, 
      icon: AlertTriangle, 
      color: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      trend: 'normal'
    },
    {
      label: 'Avg Resolution',
      value: avgResolutionTime ? `${avgResolutionTime.toFixed(1)}h` : '0h',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      trend: avgResolutionTime < 24 ? 'positive' : 'normal'
    }
  ];

  const completionRate = totalAssigned > 0 ? (resolvedCount / totalAssigned) * 100 : 0;
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className={`bg-gradient-to-br from-slate-900/90 to-slate-800/90 border ${stat.border} p-6`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} border ${stat.border}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                {stat.trend === 'warning' && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                    High
                  </Badge>
                )}
              </div>
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Performance Metrics */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Performance Metrics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">Completion Rate</span>
              <span className="text-white font-semibold">{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
          
          {rulingDistribution && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Ruling Balance</span>
                <div className="flex gap-2 text-xs">
                  <Badge className="bg-emerald-500/20 text-emerald-400">Seller: {rulingDistribution.favor_seller}</Badge>
                  <Badge className="bg-blue-500/20 text-blue-400">Buyer: {rulingDistribution.favor_buyer}</Badge>
                  <Badge className="bg-purple-500/20 text-purple-400">Split: {rulingDistribution.split}</Badge>
                </div>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-slate-800">
                <div 
                  className="bg-emerald-500" 
                  style={{ width: `${resolvedCount > 0 ? (rulingDistribution.favor_seller / resolvedCount) * 100 : 0}%` }}
                />
                <div 
                  className="bg-blue-500" 
                  style={{ width: `${resolvedCount > 0 ? (rulingDistribution.favor_buyer / resolvedCount) * 100 : 0}%` }}
                />
                <div 
                  className="bg-purple-500" 
                  style={{ width: `${resolvedCount > 0 ? (rulingDistribution.split / resolvedCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}