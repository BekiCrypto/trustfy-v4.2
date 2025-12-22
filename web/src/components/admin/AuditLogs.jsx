import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Search, 
  Filter,
  ArrowLeftRight,
  AlertTriangle,
  UserPlus,
  ShieldCheck,
  DollarSign,
  Settings,
  Download,
  Calendar,
  TrendingUp,
  Activity
} from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { toast } from "sonner";
import WalletAddress from "../common/WalletAddress";
import LoadingSpinner from "../common/LoadingSpinner";

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  
  // Fetch all entities for audit trail
  const { data: trades = [], isLoading: loadingTrades } = useQuery({
    queryKey: ['audit-trades'],
    queryFn: () => base44.entities.Trade.list('-updated_date', 200)
  });
  
  const { data: disputes = [], isLoading: loadingDisputes } = useQuery({
    queryKey: ['audit-disputes'],
    queryFn: () => base44.entities.Dispute.list('-updated_date', 100)
  });
  
  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['audit-profiles'],
    queryFn: () => base44.entities.UserProfile.list()
  });
  
  const { data: offers = [], isLoading: loadingOffers } = useQuery({
    queryKey: ['audit-offers'],
    queryFn: () => base44.entities.TradeOffer.list('-updated_date', 100)
  });

  const { data: policies = [], isLoading: loadingPolicies } = useQuery({
    queryKey: ['audit-policies'],
    queryFn: () => base44.entities.InsurancePolicy.list('-updated_date', 50)
  });

  if (loadingTrades || loadingDisputes || loadingProfiles || loadingOffers || loadingPolicies) {
    return <LoadingSpinner text="Loading audit logs..." />;
  }

  // Combine and format all activity
  const auditEntries = [
    ...trades.map(t => ({
      id: t.id,
      type: 'trade',
      action: `Trade ${t.status}`,
      entity: 'Trade',
      entityId: t.trade_id,
      user: t.created_by,
      timestamp: t.updated_date || t.created_date,
      details: `${t.amount} ${t.token_symbol} - ${t.seller_address} → ${t.buyer_address}`,
      status: t.status,
      icon: ArrowLeftRight
    })),
    ...disputes.map(d => ({
      id: d.id,
      type: 'dispute',
      action: `Dispute ${d.status}`,
      entity: 'Dispute',
      entityId: d.trade_id,
      user: d.created_by,
      timestamp: d.updated_date || d.created_date,
      details: `Reason: ${d.reason}`,
      status: d.status,
      icon: AlertTriangle
    })),
    ...profiles.map(p => ({
      id: p.id,
      type: 'user',
      action: `Profile ${p.kyc_status === 'verified' ? 'KYC Verified' : 'Updated'}`,
      entity: 'UserProfile',
      entityId: p.wallet_address,
      user: p.wallet_address,
      timestamp: p.updated_date || p.created_date,
      details: `Reputation: ${p.reputation_score} - ${p.reputation_tier}`,
      status: 'active',
      icon: UserPlus
    })),
    ...offers.map(o => ({
      id: o.id,
      type: 'offer',
      action: `Offer ${o.status}`,
      entity: 'TradeOffer',
      entityId: o.offer_id,
      user: o.created_by,
      timestamp: o.updated_date || o.created_date,
      details: `${o.offer_type}: ${o.amount} ${o.token_symbol} @ ${o.price_per_unit}`,
      status: o.status,
      icon: DollarSign
    })),
    ...policies.map(p => ({
      id: p.id,
      type: 'insurance',
      action: `Policy ${p.status}`,
      entity: 'InsurancePolicy',
      entityId: p.policy_id,
      user: p.insured_address,
      timestamp: p.updated_date || p.created_date,
      details: `Coverage: $${p.coverage_amount} - Premium: $${p.premium_amount}`,
      status: p.status,
      icon: ShieldCheck
    }))
  ]
  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Filter logs
  const filteredLogs = auditEntries.filter(entry => {
    const matchesSearch = 
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.entityId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.details?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEntity = entityFilter === 'all' || entry.type === entityFilter;
    
    // Date filtering
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const entryDate = new Date(entry.timestamp);
      const now = new Date();
      if (dateFilter === 'today') {
        matchesDate = entryDate >= startOfDay(now) && entryDate <= endOfDay(now);
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        matchesDate = entryDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
        matchesDate = entryDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesEntity && matchesDate;
  });

  const handleExportLogs = () => {
    const csv = [
      ['Type', 'Action', 'Entity ID', 'User', 'Details', 'Status', 'Timestamp'].join(','),
      ...filteredLogs.map(log => [
        log.type,
        log.action,
        log.entityId,
        log.user,
        `"${log.details}"`,
        log.status,
        format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit logs exported');
  };

  const entityCounts = {
    all: auditEntries.length,
    trade: auditEntries.filter(e => e.type === 'trade').length,
    dispute: auditEntries.filter(e => e.type === 'dispute').length,
    user: auditEntries.filter(e => e.type === 'user').length,
    offer: auditEntries.filter(e => e.type === 'offer').length,
    insurance: auditEntries.filter(e => e.type === 'insurance').length
  };

  const statusColors = {
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    active: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    disputed: 'bg-red-500/20 text-red-400 border-red-500/30',
    cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    open: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    matched: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">System Audit Logs</h3>
            <p className="text-slate-400 text-sm">Complete activity trail across all entities</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400 text-xs">Total Events</span>
            </div>
            <p className="text-white text-xl font-bold">{filteredLogs.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400 text-xs">Today</span>
            </div>
            <p className="text-white text-xl font-bold">
              {auditEntries.filter(e => new Date(e.timestamp) >= startOfDay(new Date())).length}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400 text-xs">Unique Users</span>
            </div>
            <p className="text-white text-xl font-bold">
              {new Set(auditEntries.map(e => e.user)).size}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-slate-400 text-xs">Disputes</span>
            </div>
            <p className="text-white text-xl font-bold">{entityCounts.dispute}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search by ID, user, action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleExportLogs}
              className="border-slate-600 text-slate-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          
          <div className="flex gap-3">
            <Tabs value={entityFilter} onValueChange={setEntityFilter} className="flex-1">
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="all">All ({entityCounts.all})</TabsTrigger>
                <TabsTrigger value="trade">Trades ({entityCounts.trade})</TabsTrigger>
                <TabsTrigger value="dispute">Disputes ({entityCounts.dispute})</TabsTrigger>
                <TabsTrigger value="user">Users ({entityCounts.user})</TabsTrigger>
                <TabsTrigger value="offer">Offers ({entityCounts.offer})</TabsTrigger>
                <TabsTrigger value="insurance">Insurance ({entityCounts.insurance})</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={dateFilter} onValueChange={setDateFilter} className="w-auto">
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="all">All Time</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="bg-slate-900/50 border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="text-left p-4 text-slate-400 text-xs font-medium">Type</th>
                <th className="text-left p-4 text-slate-400 text-xs font-medium">Action</th>
                <th className="text-left p-4 text-slate-400 text-xs font-medium">Entity ID</th>
                <th className="text-left p-4 text-slate-400 text-xs font-medium">User</th>
                <th className="text-left p-4 text-slate-400 text-xs font-medium">Details</th>
                <th className="text-left p-4 text-slate-400 text-xs font-medium">Status</th>
                <th className="text-left p-4 text-slate-400 text-xs font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.slice(0, 100).map((entry) => {
                const Icon = entry.icon;
                return (
                  <tr key={`${entry.type}-${entry.id}`} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300 text-xs capitalize">{entry.entity}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white text-sm font-medium">{entry.action}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-300 text-xs font-mono">
                        {entry.entityId?.slice(0, 16)}...
                      </span>
                    </td>
                    <td className="p-4">
                      <WalletAddress address={entry.user} short />
                    </td>
                    <td className="p-4">
                      <span className="text-slate-400 text-xs">{entry.details}</span>
                    </td>
                    <td className="p-4">
                      <Badge className={statusColors[entry.status] || 'bg-slate-500/20 text-slate-400'}>
                        {entry.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-slate-300 text-xs">
                          {format(new Date(entry.timestamp), 'MMM d, HH:mm')}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {format(new Date(entry.timestamp), 'yyyy')}
                        </p>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No audit logs found
          </div>
        )}
        
        {filteredLogs.length > 100 && (
          <div className="p-4 border-t border-slate-700 text-center text-slate-400 text-sm">
            Showing first 100 of {filteredLogs.length} logs
          </div>
        )}
      </Card>
    </div>
  );
}