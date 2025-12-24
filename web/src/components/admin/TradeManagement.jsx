import React, { useState } from 'react';
import { adminApi } from "@/api/admin";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ExternalLink, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import StatusBadge from "../common/StatusBadge";
import ChainBadge from "../common/ChainBadge";
import WalletAddress from "../common/WalletAddress";

export default function TradeManagement() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const limit = 20;
  
  const { data: tradesData, isLoading } = useQuery({
    queryKey: ['admin-trades', page, statusFilter],
    queryFn: () => adminApi.listTrades(page, limit, statusFilter === 'all' ? '' : statusFilter),
    keepPreviousData: true
  });

  const trades = tradesData?.data || [];
  const meta = tradesData?.meta || { total: 0, totalPages: 0 };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-4 space-y-4">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-slate-800/50 flex-wrap h-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="AWAITING_PAYMENT">Awaiting Payment</TabsTrigger>
            <TabsTrigger value="AWAITING_DELIVERY">Awaiting Delivery</TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
            <TabsTrigger value="DISPUTED">Disputed</TabsTrigger>
            <TabsTrigger value="CANCELED">Canceled</TabsTrigger>
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
              {trades.map((trade) => (
                <tr key={trade.escrowId} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-mono text-sm">{String(trade.escrowId).slice(0, 10)}...</p>
                      <ChainBadge chainId={trade.chainId} />
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={trade.state} />
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-white font-semibold">{trade.amount}</p>
                      <p className="text-slate-500 text-xs truncate max-w-[100px]" title={trade.tokenKey}>{trade.tokenKey}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <WalletAddress address={trade.seller} />
                  </td>
                  <td className="p-4">
                    {trade.buyer ? <WalletAddress address={trade.buyer} /> : <span className="text-slate-500">-</span>}
                  </td>
                  <td className="p-4">
                    <p className="text-slate-400 text-sm">
                      {format(new Date(trade.createdAt), 'MMM d, yyyy')}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link to={createPageUrl(`TradeDetails?id=${trade.escrowId}`)}>
                        <Button size="sm" variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {trades.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No trades found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-slate-400">
          Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, meta.total)} of {meta.total} trades
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-slate-700 text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="border-slate-700 text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}