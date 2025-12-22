import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import StatsCard from "../common/StatsCard";
import { 
  DollarSign, 
  ArrowLeftRight, 
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown
} from "lucide-react";

export default function MetricsOverview({ trades = [], disputes = [], policies = [] }) {
  const { t } = useTranslation();
  // Calculate metrics
  const totalVolume = trades.reduce((sum, trade) => sum + (trade.amount || 0), 0);
  const completedTrades = trades.filter(t => t.status === 'completed').length;
  const disputedTrades = trades.filter(t => t.status === 'disputed').length;
  const insuredTrades = trades.filter(t => t.is_insured).length;
  
  const successRate = trades.length > 0 
    ? ((completedTrades / trades.length) * 100).toFixed(1) 
    : 0;
    
  const disputeRate = trades.length > 0 
    ? ((disputedTrades / trades.length) * 100).toFixed(1) 
    : 0;
    
  const insuranceRate = trades.length > 0 
    ? ((insuredTrades / trades.length) * 100).toFixed(1) 
    : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title={t('analytics.tradingVolume')}
        value={`$${totalVolume.toLocaleString()}`}
        subtitle={`${trades.length} ${t('dashboard.trades')}`}
        icon={DollarSign}
        gradient="from-blue-500 to-cyan-500"
        trend="up"
        trendValue="+12.5%"
      />
      
      <StatsCard
        title={t('adminStats.successRate')}
        value={`${successRate}%`}
        subtitle={`${completedTrades} ${t('dashboard.completed')}`}
        icon={TrendingUp}
        gradient="from-emerald-500 to-teal-500"
        trend="up"
        trendValue="+3.2%"
      />
      
      <StatsCard
        title={t('analytics.disputeRate')}
        value={`${disputeRate}%`}
        subtitle={`${disputedTrades} ${t('disputes.title')}`}
        icon={AlertTriangle}
        gradient="from-amber-500 to-orange-500"
        trend={parseFloat(disputeRate) < 5 ? 'up' : 'down'}
        trendValue={parseFloat(disputeRate) < 5 ? t('cards.insurance.low') : t('cards.insurance.high')}
      />
      
      <StatsCard
        title={t('adminStats.insuranceAdoption')}
        value={`${insuranceRate}%`}
        subtitle={`${insuredTrades} ${t('myAds.insurance.insured')}`}
        icon={Shield}
        gradient="from-purple-500 to-pink-500"
        trend="up"
        trendValue="+8.7%"
      />
    </div>
  );
}
