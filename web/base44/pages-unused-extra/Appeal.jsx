import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  AlertTriangle,
  Loader2,
  Scale
} from "lucide-react";
import DisputeCard from "../components/dispute/DisputeCard";
import { Shield } from "lucide-react";

export default function Appeal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });
  
  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ['my-disputes', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return [];
      // Get disputes where user is initiator or involved in the trade
      const myDisputes = await base44.entities.Dispute.filter({ initiator_address: currentUser.email }, '-created_date');
      const trades = await base44.entities.Trade.filter({ 
        $or: [
          { seller_address: currentUser.email },
          { buyer_address: currentUser.email }
        ]
      });
      const tradeIds = trades.map(t => t.trade_id);
      const tradeDisputes = await base44.entities.Dispute.filter({ trade_id: { $in: tradeIds } }, '-created_date');
      
      // Combine and deduplicate
      const allDisputes = [...myDisputes, ...tradeDisputes];
      const uniqueDisputes = Array.from(new Map(allDisputes.map(d => [d.id, d])).values());
      return uniqueDisputes.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!currentUser,
    refetchInterval: 15000
  });
  
  // Calculate priority based on age and escalation
  const calculatePriority = (dispute) => {
    const ageInHours = (Date.now() - new Date(dispute.created_date)) / (1000 * 60 * 60);
    if (dispute.escalation_level === 3 || ageInHours > 48) return 'critical';
    if (dispute.escalation_level === 2 || ageInHours > 24) return 'high';
    if (ageInHours > 12) return 'medium';
    return 'low';
  };

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = 
      dispute.trade_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.initiator_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    const priority = calculatePriority(dispute);
    const matchesPriority = priorityFilter === 'all' || priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  const statusCounts = {
    all: disputes.length,
    pending: disputes.filter(d => d.status === 'pending').length,
    automated_review: disputes.filter(d => d.status === 'automated_review').length,
    arbitration: disputes.filter(d => d.status === 'arbitration').length,
    dao_vote: disputes.filter(d => d.status === 'dao_vote').length,
    resolved: disputes.filter(d => d.status === 'resolved').length
  };
  
  const stats = {
    totalDisputes: disputes.length,
    activeDisputes: disputes.filter(d => !['resolved', 'rejected'].includes(d.status)).length,
    resolvedDisputes: disputes.filter(d => d.status === 'resolved').length,
    avgResolutionTime: disputes.filter(d => d.resolved_at).length > 0
      ? disputes
          .filter(d => d.resolved_at)
          .reduce((sum, d) => sum + (new Date(d.resolved_at) - new Date(d.created_date)) / (1000 * 60 * 60), 0) /
        disputes.filter(d => d.resolved_at).length
      : 0
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
            Appeal
          </h1>
          <p className="text-slate-400 mt-1">
            View and manage order appeals
          </p>
        </motion.div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Total Appeals</p>
            <p className="text-2xl font-bold text-white">{stats.totalDisputes}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <p className="text-amber-400 text-sm mb-1">Active</p>
            <p className="text-2xl font-bold text-white">{stats.activeDisputes}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-emerald-400 text-sm mb-1">Resolved</p>
            <p className="text-2xl font-bold text-white">{stats.resolvedDisputes}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-400 text-sm mb-1">Avg Resolution</p>
            <p className="text-2xl font-bold text-white">{stats.avgResolutionTime.toFixed(1)}h</p>
          </div>
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search by Order ID, wallet, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <Tabs value={priorityFilter} onValueChange={setPriorityFilter} className="w-auto">
            <TabsList className="bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">All</TabsTrigger>
              <TabsTrigger value="critical" className="data-[state=active]:bg-red-700 text-xs">Critical</TabsTrigger>
              <TabsTrigger value="high" className="data-[state=active]:bg-orange-700 text-xs">High</TabsTrigger>
              <TabsTrigger value="medium" className="data-[state=active]:bg-yellow-700 text-xs">Medium</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>
        
        {/* Status Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap h-auto">
            <TabsTrigger value="all" className="data-[state=active]:bg-slate-700 text-slate-300">
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-slate-700 text-slate-300">
              Pending ({statusCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="automated_review" className="data-[state=active]:bg-slate-700 text-slate-300">
              Under Review ({statusCounts.automated_review})
            </TabsTrigger>
            <TabsTrigger value="arbitration" className="data-[state=active]:bg-slate-700 text-slate-300">
              Arbitration ({statusCounts.arbitration})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="data-[state=active]:bg-slate-700 text-slate-300">
              Resolved ({statusCounts.resolved})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Appeals List */}
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
                {searchQuery ? 'No appeals found' : 'No appeals'}
              </h3>
              <p className="text-slate-500">
                {searchQuery 
                  ? 'Try adjusting your search or filters'
                  : 'All orders are running smoothly'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {filteredDisputes.map((dispute, index) => (
                <DisputeCard 
                  key={dispute.id} 
                  dispute={dispute} 
                  index={index}
                  priority={calculatePriority(dispute)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Results Info */}
        {!isLoading && filteredDisputes.length > 0 && (
          <div className="text-center text-sm text-slate-500 pt-4">
            Showing {filteredDisputes.length} of {disputes.length} appeals
          </div>
        )}
        
        {/* Help Section */}
        {disputes.length === 0 && !isLoading && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">About Appeals</h3>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>• You can file an appeal if you have a dispute with your trade counterparty</li>
              <li>• Appeals go through AI review first, then human arbitration if needed</li>
              <li>• Provide clear evidence to support your case</li>
              <li>• Most appeals are resolved within few minutes-48 hours</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}