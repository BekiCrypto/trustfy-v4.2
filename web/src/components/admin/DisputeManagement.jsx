import { useState } from 'react';
import { adminApi } from "@/api/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ExternalLink, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import StatusBadge from "../common/StatusBadge";
import WalletAddress from "../common/WalletAddress";

export default function DisputeManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 20;
  const queryClient = useQueryClient();
  
  const { data: disputesData, isLoading } = useQuery({
    queryKey: ['admin-disputes', page, statusFilter],
    queryFn: () => adminApi.listDisputes(page, limit, statusFilter === 'all' ? '' : statusFilter),
    keepPreviousData: true
  });

  const disputes = disputesData?.data || [];
  const meta = disputesData?.meta || { total: 0, totalPages: 0 };
  
  const resolveDispute = useMutation({
    mutationFn: ({ escrowId, outcome }) => adminApi.resolveDispute(escrowId, outcome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
      toast.success('Dispute resolved successfully');
    },
    onError: (error) => {
      toast.error('Failed to resolve dispute: ' + (error.response?.data?.message || error.message));
    }
  });
  
  const handleResolve = (escrowId, ruling) => {
    // ruling: 'favor_seller' -> 'seller', 'favor_buyer' -> 'buyer'
    const outcome = ruling === 'favor_seller' ? 'seller' : 'buyer';
    if (confirm(`Resolve dispute in favor of ${outcome}?`)) {
      resolveDispute.mutate({ escrowId, outcome });
    }
  };
  
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
            <TabsTrigger value="OPEN">Open</TabsTrigger>
            <TabsTrigger value="RESOLVED">Resolved</TabsTrigger>
            <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>
      
      {/* Disputes Table */}
      <Card className="bg-slate-900/50 border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Trade ID</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Initiator</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Reason</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Created</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((dispute) => (
                <tr key={dispute.escrowId} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="p-4">
                    <p className="text-white font-mono text-sm">{String(dispute.escrowId).slice(0, 10)}...</p>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={dispute.status} />
                  </td>
                  <td className="p-4">
                    <WalletAddress address={dispute.openedBy} />
                  </td>
                  <td className="p-4">
                    <p className="text-slate-300 text-sm max-w-xs truncate">{dispute.reasonCode} - {dispute.summary}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-400 text-sm">
                      {format(new Date(dispute.createdAt), 'MMM d, yyyy')}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link to={createPageUrl(`DisputeDetails?id=${dispute.escrowId}`)}>
                        <Button size="sm" variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </Link>
                      {dispute.status !== 'RESOLVED' && dispute.status !== 'REJECTED' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleResolve(dispute.escrowId, 'favor_seller')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                          >
                            Seller
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleResolve(dispute.escrowId, 'favor_buyer')}
                            className="bg-blue-600 hover:bg-blue-700 text-xs"
                          >
                            Buyer
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {disputes.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No disputes found
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
          Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, meta.total)} of {meta.total} disputes
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
