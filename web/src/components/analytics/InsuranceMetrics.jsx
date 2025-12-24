import React, { useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Shield, TrendingUp, DollarSign } from "lucide-react";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
      <p className="text-slate-400 text-xs mb-2">{payload[0].payload.date}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <span className="text-xs" style={{ color: entry.color }}>{entry.name}:</span>
          <span className="text-white font-semibold text-sm">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function InsuranceMetrics({ policies = [], trades = [] }) {
  const { t } = useTranslation();
  const metrics = useMemo(() => {
    const totalPolicies = policies.length;
    const activePolicies = policies.filter(p => p.status === 'active').length;
    const claimedPolicies = policies.filter(p => p.status === 'claimed').length;
    
    const totalPremiums = policies.reduce((sum, p) => sum + (p.premium_amount || 0), 0);
    const totalCoverage = policies.reduce((sum, p) => sum + (p.coverage_amount || 0), 0);
    
    const insuredTrades = trades.filter(t => t.is_insured).length;
    const adoptionRate = trades.length > 0 ? ((insuredTrades / trades.length) * 100).toFixed(1) : 0;
    const claimRate = totalPolicies > 0 ? ((claimedPolicies / totalPolicies) * 100).toFixed(1) : 0;
    
    return {
      totalPolicies,
      activePolicies,
      claimedPolicies,
      totalPremiums,
      totalCoverage,
      adoptionRate,
      claimRate
    };
  }, [policies, trades]);
  
  // Generate chart data
  const chartData = useMemo(() => {
    const last30Days = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayPolicies = policies.filter(p => {
        const policyDate = new Date(p.created_date).toISOString().split('T')[0];
        return policyDate === dateStr;
      });
      
      const dayClaims = policies.filter(p => {
        const claimDate = p.claim_id && new Date(p.updated_date).toISOString().split('T')[0];
        return claimDate === dateStr;
      });
      
      last30Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        policies: dayPolicies.length,
        claims: dayClaims.length
      });
    }
    
    return last30Days;
  }, [policies]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              {t('insurance.title')}
            </h3>
            <p className="text-sm text-slate-400 mt-1">{t('insurance.subtitle')}</p>
          </div>
        </div>
        
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-purple-400">{t('common.total')} {t('insurance.policies')}</p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.totalPolicies}</p>
            <p className="text-xs text-slate-500 mt-1">{metrics.activePolicies} {t('status.active')}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-emerald-400">{t('adminStats.insuranceAdoption')}</p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.adoptionRate}%</p>
            <p className="text-xs text-slate-500 mt-1">{t('common.all')} {t('dashboard.trades')}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-blue-400">{t('common.total')} {t('insurance.premium')}</p>
            </div>
            <p className="text-2xl font-bold text-white">${metrics.totalPremiums.toLocaleString()}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-amber-400">{t('insurance.claims')}</p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.claimRate}%</p>
            <p className="text-xs text-slate-500 mt-1">{metrics.claimedPolicies} {t('insurance.claims')}</p>
          </div>
        </div>
        
        {/* Policies vs Claims Chart */}
        <div className="mt-6">
          <p className="text-sm font-medium text-slate-400 mb-4">{t('analytics.last30Days')}</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={10}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
              <Line 
                type="monotone" 
                dataKey="policies" 
                stroke="#a855f7" 
                strokeWidth={2}
                name={t('insurance.policies')}
                dot={{ fill: '#a855f7', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="claims" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name={t('insurance.claims')}
                dot={{ fill: '#f59e0b', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}
