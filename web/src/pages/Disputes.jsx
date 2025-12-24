import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Search, 
  AlertTriangle,
  Loader2,
  Scale
} from "lucide-react";
import DisputeCard from "../components/dispute/DisputeCard";

export default function Disputes() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ['disputes'],
    queryFn: () => base44.entities.Dispute.list('-created_date', 100)
  });
  
  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = 
      dispute.trade_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.initiator_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const statusCounts = {
    all: disputes.length,
    pending: disputes.filter(d => d.status === 'pending').length,
    automated_review: disputes.filter(d => d.status === 'automated_review').length,
    arbitration: disputes.filter(d => d.status === 'arbitration').length,
    dao_vote: disputes.filter(d => d.status === 'dao_vote').length,
    resolved: disputes.filter(d => d.status === 'resolved').length
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
            {t('disputes.title')}
          </h1>
          <p className="text-slate-400 mt-1">
            {t('disputes.subtitle')}
          </p>
        </motion.div>
        
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder={t('disputes.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </motion.div>
        
        {/* Status Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap h-auto">
            <TabsTrigger value="all" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('common.all')} ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('status.pending')} ({statusCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="automated_review" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('disputes.aiReview')} ({statusCounts.automated_review})
            </TabsTrigger>
            <TabsTrigger value="arbitration" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('disputes.arbitration')} ({statusCounts.arbitration})
            </TabsTrigger>
            <TabsTrigger value="dao_vote" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('disputes.daoVote')} ({statusCounts.dao_vote})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('disputes.resolved')} ({statusCounts.resolved})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Disputes List */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredDisputes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 bg-slate-800/30 rounded-xl border border-slate-700/50"
            >
              <Scale className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">
                {searchQuery ? t('disputes.noDisputesFound') : t('disputes.noDisputes')}
              </h3>
              <p className="text-slate-500">
                {searchQuery 
                  ? t('orders.adjustSearch')
                  : t('disputes.allTradesSmooth')}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {filteredDisputes.map((dispute, index) => (
                <DisputeCard key={dispute.id} dispute={dispute} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
