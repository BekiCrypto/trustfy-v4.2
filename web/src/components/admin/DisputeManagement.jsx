import { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import StatusBadge from "../common/StatusBadge";
import WalletAddress from "../common/WalletAddress";

export default function DisputeManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();
  
  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ['all-disputes'],
    queryFn: () => base44.entities.Dispute.list('-created_date')
  });
  
  const updateDispute = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Dispute.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-disputes'] });
      toast.success('Dispute updated successfully');
    }
  });
  
  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = 
      dispute.trade_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.initiator_address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleResolve = (disputeId, ruling) => {
    if (confirm(`Resolve dispute in favor of ${ruling}?`)) {
      updateDispute.mutate({ 
        id: disputeId, 
        data: { 
          status: 'resolved',
          ruling: ruling
        }
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
    all: disputes.length,
    pending: disputes.filter(d => d.status === 'pending').length,
    automated_review: disputes.filter(d => d.status === 'automated_review').length,
    arbitration: disputes.filter(d => d.status === 'arbitration').length,
    dao_vote: disputes.filter(d => d.status === 'dao_vote').length,
    resolved: disputes.filter(d => d.status === 'resolved').length
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
            placeholder="Search by trade ID or address..."
            className="pl-10 bg-slate-800 border-slate-700"
          />
        </div>
        
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-slate-800/50 flex-wrap h-auto">
            <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
            <TabsTrigger value="automated_review">AI Review ({statusCounts.automated_review})</TabsTrigger>
            <TabsTrigger value="arbitration">Arbitration ({statusCounts.arbitration})</TabsTrigger>
            <TabsTrigger value="dao_vote">DAO Vote ({statusCounts.dao_vote})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({statusCounts.resolved})</TabsTrigger>
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
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Level</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Initiator</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Reason</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Created</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDisputes.map((dispute) => (
                <tr key={dispute.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="p-4">
                    <p className="text-white font-mono text-sm">{dispute.trade_id?.slice(0, 16)}...</p>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={dispute.status} />
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <span className="text-slate-400">Tier {dispute.escalation_level}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <WalletAddress address={dispute.initiator_address} />
                  </td>
                  <td className="p-4">
                    <p className="text-slate-300 text-sm max-w-xs truncate">{dispute.reason}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-400 text-sm">
                      {format(new Date(dispute.created_date), 'MMM d, yyyy')}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link to={createPageUrl(`DisputeDetails?id=${dispute.id}`)}>
                        <Button size="sm" variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </Link>
                      {dispute.status !== 'resolved' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleResolve(dispute.id, 'favor_seller')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                          >
                            Seller
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleResolve(dispute.id, 'favor_buyer')}
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
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
