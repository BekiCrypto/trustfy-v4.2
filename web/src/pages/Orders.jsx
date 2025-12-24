import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from '@/hooks/useTranslation';
import { Search, Loader2, ArrowLeftRight, Shield, Info } from "lucide-react";
import TradeCard from "../components/trade/TradeCard";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Orders() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });
  
  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['my-trades', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return [];
      const sellerTrades = await base44.entities.Trade.filter({ seller_address: currentUser.email }, '-created_date');
      const buyerTrades = await base44.entities.Trade.filter({ buyer_address: currentUser.email }, '-created_date');
      return [...sellerTrades, ...buyerTrades].sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      );
    },
    enabled: !!currentUser,
    refetchInterval: 30000,
    staleTime: 20000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
  
  const filteredTrades = trades.filter(trade => {
    const matchesSearch = 
      trade.trade_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.seller_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.buyer_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.token_symbol?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'unpaid') {
      matchesStatus = trade.status === 'pending' || trade.status === 'funded';
    } else if (statusFilter === 'paid') {
      matchesStatus = trade.status === 'in_progress';
    } else if (statusFilter === 'completed') {
      matchesStatus = trade.status === 'completed';
    } else if (statusFilter === 'appeal') {
      matchesStatus = trade.status === 'disputed';
    } else if (statusFilter !== 'all') {
      matchesStatus = trade.status === statusFilter;
    }
    
    let matchesRole = true;
    if (currentUser) {
      if (roleFilter === 'buyer') {
        matchesRole = trade.buyer_address === currentUser.email;
      } else if (roleFilter === 'seller') {
        matchesRole = trade.seller_address === currentUser.email;
      }
    }
    
    return matchesSearch && matchesStatus && matchesRole;
  });
  
  const statusCounts = {
    all: trades.length,
    unpaid: trades.filter(t => t.status === 'pending' || t.status === 'funded').length,
    paid: trades.filter(t => t.status === 'in_progress').length,
    completed: trades.filter(t => t.status === 'completed').length,
    appeal: trades.filter(t => t.status === 'disputed').length
  };
  
  const stats = {
    totalTrades: trades.length,
    activeTrades: trades.filter(t => ['pending', 'funded', 'in_progress'].includes(t.status)).length,
    completedTrades: trades.filter(t => t.status === 'completed').length,
    totalVolume: trades.reduce((sum, t) => sum + (t.amount || 0), 0)
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {t('ordersPage.title')}
          </h1>
          <p className="text-slate-400 mt-1">{t('ordersPage.subtitle')}</p>
        </motion.div>
        
        {/* Escrow Notice */}
        <Alert className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
          <Shield className="h-4 w-4 text-purple-400" />
          <AlertDescription className="text-purple-300 text-sm">
            {t('ordersPage.notice')}
          </AlertDescription>
        </Alert>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 md:p-4">
            <p className="text-slate-400 text-xs md:text-sm mb-1">{t('ordersPage.total')}</p>
            <p className="text-xl md:text-2xl font-bold text-white">{stats.totalTrades}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 md:p-4">
            <p className="text-blue-400 text-xs md:text-sm mb-1">{t('ordersPage.active')}</p>
            <p className="text-xl md:text-2xl font-bold text-white">{stats.activeTrades}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 md:p-4">
            <p className="text-emerald-400 text-xs md:text-sm mb-1">{t('ordersPage.done')}</p>
            <p className="text-xl md:text-2xl font-bold text-white">{stats.completedTrades}</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 md:p-4">
            <p className="text-purple-400 text-xs md:text-sm mb-1">{t('ordersPage.volume')}</p>
            <p className="text-xl md:text-2xl font-bold text-white">{stats.totalVolume.toFixed(2)}</p>
          </div>
        </div>

        {/* Search & Role Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder={t('ordersPage.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <Tabs value={roleFilter} onValueChange={setRoleFilter} className="w-auto">
            <TabsList className="bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">{t('ordersPage.all')}</TabsTrigger>
              <TabsTrigger value="buyer" className="data-[state=active]:bg-slate-700">{t('ordersPage.asBuyer')}</TabsTrigger>
              <TabsTrigger value="seller" className="data-[state=active]:bg-slate-700">{t('ordersPage.asSeller')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>
        
        {/* Status Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap h-auto">
            <TabsTrigger value="all" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('common.all')} ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="unpaid" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('ordersPage.status.createdFunded', { count: statusCounts.unpaid })}
            </TabsTrigger>
            <TabsTrigger value="paid" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('ordersPage.status.paymentConfirmed', { count: statusCounts.paid })}
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('ordersPage.status.resolved', { count: statusCounts.completed })}
            </TabsTrigger>
            <TabsTrigger value="appeal" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('ordersPage.status.disputed', { count: statusCounts.appeal })}
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('ordersPage.status.cancelled', { count: trades.filter(t => t.status === 'cancelled').length })}
            </TabsTrigger>
            <TabsTrigger value="expired" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('ordersPage.status.cancelledExpired', { count: trades.filter(t => t.status === 'expired').length })}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Results Count */}
        {!isLoading && filteredTrades.length > 0 && (
          <div className="text-sm text-slate-400">
            {t('ordersPage.resultsCount', { shown: filteredTrades.length, total: trades.length })}
          </div>
        )}
        
        {/* Orders List */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredTrades.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 bg-slate-800/30 rounded-xl border border-slate-700/50"
            >
              <ArrowLeftRight className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">
                {searchQuery ? t('ordersPage.empty.searchTitle') : t('ordersPage.empty.noneTitle')}
              </h3>
              <p className="text-slate-500">
                {searchQuery 
                  ? t('ordersPage.empty.searchBody')
                  : t('ordersPage.empty.noneBody')}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4"
            >
              {filteredTrades.map((trade, index) => (
                <TradeCard key={trade.id} trade={trade} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
