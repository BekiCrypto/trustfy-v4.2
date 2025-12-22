import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ExternalLink, Ban, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import StatusBadge from "../common/StatusBadge";
import ChainBadge from "../common/ChainBadge";
import WalletAddress from "../common/WalletAddress";

export default function TradeManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();
  
  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['all-trades'],
    queryFn: () => base44.entities.Trade.list('-created_date')
  });
  
  const updateTrade = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Trade.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-trades'] });
      toast.success('Trade updated successfully');
    }
  });
  
  const filteredTrades = trades.filter(trade => {
    const matchesSearch = 
      trade.trade_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.seller_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.buyer_address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || trade.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleCancelTrade = (tradeId) => {
    if (confirm('Are you sure you want to cancel this trade?')) {
      updateTrade.mutate({ 
        id: tradeId, 
        data: { status: 'cancelled' }
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }
  
  const statusCounts = {
    all: trades.length,
    pending: trades.filter(t => t.status === 'pending').length,
    funded: trades.filter(t => t.status === 'funded').length,
    in_progress: trades.filter(t => t.status === 'in_progress').length,
    completed: trades.filter(t => t.status === 'completed').length,
    disputed: trades.filter(t => t.status === 'disputed').length
  };
  
  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by trade ID or wallet address..."
            className="pl-10 bg-slate-800 border-slate-700"
          />
        </div>
        
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-slate-800/50 flex-wrap h-auto">
            <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
            <TabsTrigger value="funded">Funded ({statusCounts.funded})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({statusCounts.in_progress})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({statusCounts.completed})</TabsTrigger>
            <TabsTrigger value="disputed">Disputed ({statusCounts.disputed})</TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>
      
      {/* Trades Table */}
      <Card className="bg-slate-900/50 border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Trade ID</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Amount</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Seller</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Buyer</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Created</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade) => (
                <tr key={trade.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-mono text-sm">{trade.trade_id?.slice(0, 16)}...</p>
                      <ChainBadge chain={trade.chain} />
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={trade.status} />
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-white font-semibold">{trade.amount} {trade.token_symbol}</p>
                      {trade.total_fiat_amount && (
                        <p className="text-slate-400 text-xs">{trade.fiat_currency} {trade.total_fiat_amount.toLocaleString()}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <WalletAddress address={trade.seller_address} />
                  </td>
                  <td className="p-4">
                    <WalletAddress address={trade.buyer_address} />
                  </td>
                  <td className="p-4">
                    <p className="text-slate-400 text-sm">
                      {format(new Date(trade.created_date), 'MMM d, yyyy')}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link to={createPageUrl(`TradeDetails?id=${trade.id}`)}>
                        <Button size="sm" variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </Link>
                      {!['completed', 'cancelled', 'disputed'].includes(trade.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelTrade(trade.id)}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <Ban className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}