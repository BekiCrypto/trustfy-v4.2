import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Shield,
  TrendingUp,
  Loader2,
  Filter,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import InsuranceProviderCard from "../components/insurance/InsuranceProviderCard";
import StatsCard from "../components/common/StatsCard";

export default function InsuranceMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['insurance-providers'],
    queryFn: () => base44.entities.InsuranceProvider.list('-total_policies_written', 50)
  });
  
  const { data: policies = [] } = useQuery({
    queryKey: ['insurance-policies'],
    queryFn: () => base44.entities.InsurancePolicy.list('-created_date', 100)
  });
  
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = 
      provider.provider_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || provider.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Calculate stats
  const totalCapital = providers.reduce((acc, p) => acc + (p.capital_available || 0), 0);
  const totalPolicies = providers.reduce((acc, p) => acc + (p.total_policies_written || 0), 0);
  const activePolicies = policies.filter(p => p.status === 'active').length;
  const totalClaims = providers.reduce((acc, p) => acc + (p.total_claims_paid || 0), 0);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              Insurance Marketplace
            </h1>
            <p className="text-slate-400 mt-1">
              Decentralized trade insurance from verified providers
            </p>
          </div>
          
          <Link to={createPageUrl('BecomeInsurer')}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Become an Insurer
            </Button>
          </Link>
        </motion.div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Capital"
            value={`$${totalCapital.toLocaleString()}`}
            icon={TrendingUp}
            gradient="from-emerald-500/20 to-emerald-600/20"
            subtitle="Available for coverage"
          />
          <StatsCard
            title="Active Providers"
            value={providers.filter(p => p.status === 'active').length}
            icon={Shield}
            gradient="from-blue-500/20 to-blue-600/20"
            subtitle={`${providers.length} total providers`}
          />
          <StatsCard
            title="Policies Written"
            value={totalPolicies}
            icon={Star}
            gradient="from-purple-500/20 to-purple-600/20"
            subtitle={`${activePolicies} currently active`}
          />
          <StatsCard
            title="Claims Paid"
            value={`$${totalClaims.toLocaleString()}`}
            icon={TrendingUp}
            gradient="from-amber-500/20 to-amber-600/20"
            subtitle="Total payouts"
          />
        </div>
        
        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search insurance providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-slate-700 text-slate-300">
                All
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-slate-700 text-slate-300">
                Active
              </TabsTrigger>
              <TabsTrigger value="paused" className="data-[state=active]:bg-slate-700 text-slate-300">
                Paused
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>
        
        {/* Providers List */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredProviders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 bg-slate-800/30 rounded-xl border border-slate-700/50"
            >
              <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">
                {searchQuery ? 'No providers found' : 'No insurance providers yet'}
              </h3>
              <p className="text-slate-500 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search'
                  : 'Be the first to offer insurance coverage'}
              </p>
              {!searchQuery && (
                <Link to={createPageUrl('BecomeInsurer')}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Become an Insurer
                  </Button>
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {filteredProviders.map((provider, index) => (
                <InsuranceProviderCard key={provider.id} provider={provider} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}