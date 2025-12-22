import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, CheckCircle, XCircle, Loader2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import WalletAddress from "../common/WalletAddress";

export default function InsuranceManagement() {
  const [activeTab, setActiveTab] = useState('providers');
  const queryClient = useQueryClient();
  
  const { data: providers = [], isLoading: loadingProviders } = useQuery({
    queryKey: ['all-providers'],
    queryFn: () => base44.entities.InsuranceProvider.list()
  });
  
  const { data: policies = [], isLoading: loadingPolicies } = useQuery({
    queryKey: ['all-policies'],
    queryFn: () => base44.entities.InsurancePolicy.list('-created_date')
  });
  
  const { data: claims = [], isLoading: loadingClaims } = useQuery({
    queryKey: ['all-claims'],
    queryFn: () => base44.entities.InsuranceClaim.list('-created_date')
  });
  
  const updateProvider = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InsuranceProvider.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-providers'] });
      toast.success('Provider updated');
    }
  });
  
  const updateClaim = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InsuranceClaim.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-claims'] });
      toast.success('Claim updated');
    }
  });
  
  const handleProviderStatus = (providerId, status) => {
    updateProvider.mutate({ id: providerId, data: { status } });
  };
  
  const handleClaimDecision = (claimId, approved, payout = 0) => {
    updateClaim.mutate({
      id: claimId,
      data: {
        status: approved ? 'approved' : 'rejected',
        payout_amount: payout,
        reviewed_at: new Date().toISOString()
      }
    });
  };
  
  if (loadingProviders || loadingPolicies || loadingClaims) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-900/50 border border-slate-700/50">
          <TabsTrigger value="providers">Providers ({providers.length})</TabsTrigger>
          <TabsTrigger value="policies">Policies ({policies.length})</TabsTrigger>
          <TabsTrigger value="claims">Claims ({claims.length})</TabsTrigger>
        </TabsList>
        
        {/* Providers */}
        {activeTab === 'providers' && (
          <Card className="bg-slate-900/50 border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50 border-b border-slate-700">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Provider</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Capital</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Policies</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Claims</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((provider) => (
                    <tr key={provider.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="p-4">
                        <div>
                          <p className="text-white font-semibold">{provider.provider_name}</p>
                          <WalletAddress address={provider.wallet_address} />
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white font-semibold">${provider.capital_staked?.toLocaleString() || 0}</p>
                          <p className="text-slate-400 text-xs">Available: ${provider.capital_available?.toLocaleString() || 0}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white">{provider.total_policies_written || 0}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-white">{provider.total_claims_paid || 0}</p>
                      </td>
                      <td className="p-4">
                        <Badge className={
                          provider.status === 'active' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }>
                          {provider.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {provider.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProviderStatus(provider.id, 'suspended')}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleProviderStatus(provider.id, 'active')}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            Activate
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        
        {/* Policies */}
        {activeTab === 'policies' && (
          <Card className="bg-slate-900/50 border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50 border-b border-slate-700">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Policy ID</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Trade</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Coverage</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Premium</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((policy) => (
                    <tr key={policy.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="p-4">
                        <p className="text-white font-mono text-sm">{policy.policy_id?.slice(0, 12)}...</p>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-300 font-mono text-xs">{policy.trade_id?.slice(0, 16)}...</p>
                      </td>
                      <td className="p-4">
                        <p className="text-white font-semibold">${policy.coverage_amount?.toLocaleString()}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-emerald-400">${policy.premium_amount?.toFixed(2)}</p>
                      </td>
                      <td className="p-4">
                        <Badge className={
                          policy.status === 'active'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : policy.status === 'claimed'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }>
                          {policy.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-400 text-sm">
                          {format(new Date(policy.created_date), 'MMM d, yyyy')}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        
        {/* Claims */}
        {activeTab === 'claims' && (
          <Card className="bg-slate-900/50 border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50 border-b border-slate-700">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Claim ID</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Claimant</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Amount</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Reason</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="p-4">
                        <p className="text-white font-mono text-sm">{claim.claim_id?.slice(0, 12)}...</p>
                      </td>
                      <td className="p-4">
                        <WalletAddress address={claim.claimant_address} />
                      </td>
                      <td className="p-4">
                        <p className="text-white font-semibold">${claim.claim_amount?.toLocaleString()}</p>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {claim.claim_reason?.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={
                          claim.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : claim.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }>
                          {claim.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {claim.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleClaimDecision(claim.id, true, claim.claim_amount)}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleClaimDecision(claim.id, false)}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </Tabs>
    </div>
  );
}