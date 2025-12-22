import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  Users,
  ArrowLeftRight,
  DollarSign,
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function PlatformStats() {
  const { t } = useTranslation();
  const { data: trades = [] } = useQuery({
    queryKey: ['all-trades'],
    queryFn: () => base44.entities.Trade.list()
  });
  
  const { data: profiles = [] } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: () => base44.entities.UserProfile.list()
  });
  
  const { data: disputes = [] } = useQuery({
    queryKey: ['all-disputes'],
    queryFn: () => base44.entities.Dispute.list()
  });
  
  const { data: policies = [] } = useQuery({
    queryKey: ['all-policies'],
    queryFn: () => base44.entities.InsurancePolicy.list()
  });
  
  // Calculate stats
  const totalUsers = profiles.length;
  const totalTrades = trades.length;
  const completedTrades = trades.filter(t => t.status === 'completed').length;
  const activeTrades = trades.filter(t => ['pending', 'funded', 'in_progress'].includes(t.status)).length;
  const disputedTrades = trades.filter(t => t.status === 'disputed').length;
  const totalVolume = trades.reduce((sum, t) => sum + (t.amount || 0), 0);
  const insuredTrades = trades.filter(t => t.is_insured).length;
  const activeDisputes = disputes.filter(d => !['resolved', 'rejected'].includes(d.status)).length;
  
  // Trade status distribution
  const statusData = [
    { name: t('adminStats.completed'), value: completedTrades, color: '#10b981' },
    { name: t('adminStats.active'), value: activeTrades, color: '#3b82f6' },
    { name: t('adminStats.disputed'), value: disputedTrades, color: '#ef4444' },
    { name: t('adminStats.other'), value: totalTrades - completedTrades - activeTrades - disputedTrades, color: '#64748b' }
  ];
  
  // Token distribution
  const tokenData = Object.entries(
    trades.reduce((acc, t) => {
      acc[t.token_symbol] = (acc[t.token_symbol] || 0) + 1;
      return acc;
    }, {})
  ).map(([token, count]) => ({ token, count }));
  
  // Chain distribution
  const chainData = Object.entries(
    trades.reduce((acc, t) => {
      acc[t.chain] = (acc[t.chain] || 0) + 1;
      return acc;
    }, {})
  ).map(([chain, count]) => ({ chain, count }));
  
  const stats = [
    { label: t('adminStats.totalUsers'), value: totalUsers, icon: Users, color: 'from-blue-500 to-cyan-500', change: '+12%' },
    { label: t('adminStats.totalTrades'), value: totalTrades, icon: ArrowLeftRight, color: 'from-purple-500 to-pink-500', change: '+8%' },
    { label: t('adminStats.totalVolume'), value: `${totalVolume.toLocaleString()}`, icon: DollarSign, color: 'from-emerald-500 to-teal-500', change: '+15%' },
    { label: t('adminStats.activeDisputes'), value: activeDisputes, icon: AlertTriangle, color: 'from-amber-500 to-orange-500', change: '-5%' },
    { label: t('adminStats.insuredTrades'), value: insuredTrades, icon: Shield, color: 'from-indigo-500 to-purple-500', change: '+20%' },
    { label: t('adminStats.successRate'), value: `${totalTrades ? Math.round((completedTrades / totalTrades) * 100) : 0}%`, icon: Activity, color: 'from-green-500 to-emerald-500', change: '+3%' }
  ];
  
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.change.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade Status Distribution */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t('adminStats.tradeStatusDistribution')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                <span className="text-xs text-slate-400">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Token Distribution */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t('adminStats.tradesByToken')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tokenData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="token" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Chain Distribution */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t('adminStats.tradesByChain')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chainData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="chain" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Recent Activity Summary */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t('adminStats.platformHealth')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <span className="text-slate-400">{t('adminStats.completionRate')}</span>
              <span className="text-white font-semibold">{totalTrades ? Math.round((completedTrades / totalTrades) * 100) : 0}%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <span className="text-slate-400">{t('adminStats.disputeRate')}</span>
              <span className="text-white font-semibold">{totalTrades ? Math.round((disputedTrades / totalTrades) * 100) : 0}%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <span className="text-slate-400">{t('adminStats.insuranceAdoption')}</span>
              <span className="text-white font-semibold">{totalTrades ? Math.round((insuredTrades / totalTrades) * 100) : 0}%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <span className="text-slate-400">{t('adminStats.activeUsers')}</span>
              <span className="text-white font-semibold">{profiles.filter(p => p.total_trades > 0).length}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}