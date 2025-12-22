import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter,
  ArrowUpDown,
  Loader2,
  Wallet
} from "lucide-react";
import TradeCard from "../components/trade/TradeCard";
import CreateTradeModal from "../components/trade/CreateTradeModal";
import { useWalletGuard } from "@/components/web3/useWalletGuard";
import { useLocation } from "react-router-dom";

export default function Trades() {
  const { t } = useTranslation();
  const location = useLocation();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const { authModal } = useWalletGuard();

  useEffect(() => {
    if (location.pathname.endsWith('/escrows/create')) {
      setCreateModalOpen(true);
    }
  }, [location.pathname]);
  
  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.Trade.list('-created_date', 100)
  });
  
  // Filter and sort trades
  const filteredTrades = trades
    .filter(trade => {
      const matchesSearch = 
        trade.trade_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.seller_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.buyer_address?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || trade.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_date);
      const dateB = new Date(b.created_date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  
  const statusCounts = {
    all: trades.length,
    pending: trades.filter(t => t.status === 'pending').length,
    funded: trades.filter(t => t.status === 'funded').length,
    in_progress: trades.filter(t => t.status === 'in_progress').length,
    completed: trades.filter(t => t.status === 'completed').length,
    disputed: trades.filter(t => t.status === 'disputed').length
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              {t('tradesPage.title')}
            </h1>
            <p className="text-slate-400 mt-1">
              {t('tradesPage.subtitle')}
            </p>
          </div>
          
          <Button 
            onClick={() => setCreateModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('tradesPage.newEscrow')}
          </Button>
        </motion.div>
        
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder={t('tradesPage.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            {sortOrder === 'desc' ? t('tradesPage.sortNewest') : t('tradesPage.sortOldest')}
          </Button>
        </motion.div>
        
        {/* Status Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('tradesPage.status.all', { count: statusCounts.all })}
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('tradesPage.status.created', { count: statusCounts.pending })}
            </TabsTrigger>
            <TabsTrigger value="funded" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('tradesPage.status.funded', { count: statusCounts.funded })}
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('tradesPage.status.paymentConfirmed', { count: statusCounts.in_progress })}
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('tradesPage.status.resolved', { count: statusCounts.completed })}
            </TabsTrigger>
            <TabsTrigger value="disputed" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('tradesPage.status.disputed', { count: statusCounts.disputed })}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Trades List */}
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
              <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">
                {searchQuery ? t('tradesPage.empty.searchTitle') : t('tradesPage.empty.noTradesTitle')}
              </h3>
              <p className="text-slate-500 mb-4">
                {searchQuery 
                  ? t('tradesPage.empty.searchBody')
                  : t('tradesPage.empty.noTradesBody')}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => ensureWallet(() => setCreateModalOpen(true))}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('tradesPage.empty.createTrade')}
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {filteredTrades.map((trade, index) => (
                <TradeCard key={trade.id} trade={trade} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <CreateTradeModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      {authModal}
    </div>
  );
}
