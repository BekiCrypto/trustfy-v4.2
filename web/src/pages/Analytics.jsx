import {useState, useMemo} from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ArrowUpDown,
  Calendar,
  Loader2,
  BarChart3
} from "lucide-react";
import MetricsOverview from "../components/analytics/MetricsOverview";
import VolumeChart from "../components/analytics/VolumeChart";
import TokenDistribution from "../components/analytics/TokenDistribution";
import ChainDistribution from "../components/analytics/ChainDistribution";
import DisputeMetrics from "../components/analytics/DisputeMetrics";
import InsuranceMetrics from "../components/analytics/InsuranceMetrics";
import ComingSoonBanner from "../components/common/ComingSoonBanner";

export default function Analytics() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('30');
  const [chainFilter, setChainFilter] = useState('all');
  
  const { data: trades = [], isLoading: tradesLoading } = useQuery({
    queryKey: ['analytics-trades'],
    queryFn: () => base44.entities.Trade.list('-created_date', 500)
  });
  
  const { data: disputes = [], isLoading: disputesLoading } = useQuery({
    queryKey: ['analytics-disputes'],
    queryFn: () => base44.entities.Dispute.list('-created_date', 500)
  });
  
  const { data: policies = [], isLoading: policiesLoading } = useQuery({
    queryKey: ['analytics-policies'],
    queryFn: () => base44.entities.InsurancePolicy.list('-created_date', 500)
  });
  
  // Filter data based on time range and chain
  const filteredTrades = useMemo(() => {
    let filtered = trades;
    
    // Time range filter
    const daysAgo = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    
    filtered = filtered.filter(trade => 
      new Date(trade.created_date) >= cutoffDate
    );
    
    // Chain filter
    if (chainFilter !== 'all') {
      filtered = filtered.filter(trade => trade.chain === chainFilter);
    }
    
    return filtered;
  }, [trades, timeRange, chainFilter]);
  
  const isLoading = tradesLoading || disputesLoading || policiesLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto space-y-6">
        <ComingSoonBanner />
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-400" />
              {t('analytics.title')}
            </h1>
            <p className="text-slate-400 mt-1">
              {t('analytics.subtitle')}
            </p>
          </div>
        </motion.div>
        
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Card className="flex-1 bg-slate-900/50 border-slate-700/50 backdrop-blur-xl p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">{t('common.time')}:</span>
              </div>
              <Tabs value={timeRange} onValueChange={setTimeRange}>
                <TabsList className="bg-slate-800/50 border border-slate-700">
                  <TabsTrigger value="7" className="text-xs">{t('analytics.last7Days')}</TabsTrigger>
                  <TabsTrigger value="30" className="text-xs">{t('analytics.last30Days')}</TabsTrigger>
                  <TabsTrigger value="90" className="text-xs">{t('analytics.last90Days')}</TabsTrigger>
                  <TabsTrigger value="365" className="text-xs">{t('analytics.last365Days')}</TabsTrigger>
                  <TabsTrigger value="99999" className="text-xs">{t('analytics.allTime')}</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-slate-400">{t('cards.arbitrator.chain')}:</span>
                <Select value={chainFilter} onValueChange={setChainFilter}>
                  <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">{t('common.all')} {t('cards.arbitrator.chain')}</SelectItem>
                    <SelectItem value="BSC_TESTNET">{`${t('common.chains.bsc')} Testnet`}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* Metrics Overview */}
        <MetricsOverview trades={filteredTrades} disputes={disputes} policies={policies} />
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VolumeChart trades={filteredTrades} timeRange={timeRange} />
          <TokenDistribution trades={filteredTrades} />
          <ChainDistribution trades={filteredTrades} />
          <DisputeMetrics trades={filteredTrades} disputes={disputes} />
        </div>
        
        {/* Insurance Metrics */}
        <InsuranceMetrics policies={policies} trades={filteredTrades} />
      </div>
    </div>
  );
}
