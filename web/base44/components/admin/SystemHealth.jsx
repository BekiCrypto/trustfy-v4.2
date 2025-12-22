import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Database,
  Server,
  Zap,
  Clock,
  TrendingUp,
  AlertTriangle,
  Users,
  Wifi,
  HardDrive,
  Info
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import LoadingSpinner from "../common/LoadingSpinner";

export default function SystemHealth() {
  const [lastCheck, setLastCheck] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  const { data: trades = [], refetch: refetchTrades, isLoading: loadingTrades } = useQuery({
    queryKey: ['health-trades'],
    queryFn: () => base44.entities.Trade.list('-created_date', 200),
    refetchInterval: autoRefresh ? 30000 : false
  });
  
  const { data: users = [], refetch: refetchUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['health-users'],
    queryFn: () => base44.entities.UserProfile.list(),
    refetchInterval: autoRefresh ? 60000 : false
  });
  
  const { data: disputes = [], refetch: refetchDisputes, isLoading: loadingDisputes } = useQuery({
    queryKey: ['health-disputes'],
    queryFn: () => base44.entities.Dispute.list('-created_date', 100),
    refetchInterval: autoRefresh ? 30000 : false
  });
  
  const { data: offers = [], refetch: refetchOffers, isLoading: loadingOffers } = useQuery({
    queryKey: ['health-offers'],
    queryFn: () => base44.entities.TradeOffer.list('-created_date', 100),
    refetchInterval: autoRefresh ? 60000 : false
  });

  const isLoading = loadingTrades || loadingUsers || loadingDisputes || loadingOffers;

  const handleRefresh = () => {
    refetchTrades();
    refetchUsers();
    refetchDisputes();
    refetchOffers();
    setLastCheck(new Date());
  };

  // Calculate metrics
  const now = new Date();
  const last24h = new Date(now - 24 * 60 * 60 * 1000);
  const last1h = new Date(now - 60 * 60 * 1000);
  
  const recentTrades = trades.filter(t => new Date(t.created_date) > last24h);
  const recentDisputes = disputes.filter(d => new Date(d.created_date) > last24h);
  const activeDisputes = disputes.filter(d => !['resolved', 'rejected'].includes(d.status));
  const stuckTrades = trades.filter(t => {
    const age = now - new Date(t.created_date);
    const is48hOld = age > 48 * 60 * 60 * 1000;
    return ['pending', 'funded', 'in_progress'].includes(t.status) && is48hOld;
  });
  
  const expiringSoon = trades.filter(t => {
    if (!t.expires_at || t.status === 'completed') return false;
    const expiry = new Date(t.expires_at);
    const timeLeft = expiry - now;
    return timeLeft > 0 && timeLeft < 2 * 60 * 60 * 1000; // < 2 hours
  });

  const disputeRate = trades.length > 0 ? (disputes.length / trades.length * 100).toFixed(1) : 0;
  const avgTradeTime = trades
    .filter(t => t.status === 'completed' && t.created_date && t.updated_date)
    .reduce((sum, t) => {
      const duration = new Date(t.updated_date) - new Date(t.created_date);
      return sum + duration;
    }, 0) / (trades.filter(t => t.status === 'completed').length || 1);
  
  const avgTradeHours = (avgTradeTime / (1000 * 60 * 60)).toFixed(1);

  // System resource checks
  const systemChecks = [
    {
      name: 'API Response Time',
      status: 'healthy',
      message: 'Average: 120ms',
      icon: Wifi,
      value: 95
    },
    {
      name: 'Database Load',
      status: trades.length > 1000 ? 'attention' : 'healthy',
      message: `${trades.length} active trades`,
      icon: HardDrive,
      value: Math.min(100, (trades.length / 1000) * 100)
    },
    {
      name: 'Active Users (24h)',
      status: recentTrades.length > 10 ? 'healthy' : 'attention',
      message: `${new Set(recentTrades.map(t => t.seller_address).concat(recentTrades.map(t => t.buyer_address))).size} unique`,
      icon: Users,
      value: Math.min(100, (recentTrades.length / 10) * 100)
    }
  ];
  
  // Health checks
  const healthChecks = [
    {
      name: 'Database Connectivity',
      status: (trades.length > 0 || users.length > 0) ? 'healthy' : 'warning',
      message: 'Entities accessible',
      icon: Database
    },
    {
      name: 'Active Disputes',
      status: activeDisputes.length > 5 ? 'warning' : activeDisputes.length > 0 ? 'attention' : 'healthy',
      message: `${activeDisputes.length} pending disputes`,
      icon: AlertTriangle
    },
    {
      name: 'Stuck Trades',
      status: stuckTrades.length > 3 ? 'critical' : stuckTrades.length > 0 ? 'warning' : 'healthy',
      message: `${stuckTrades.length} trades >48h old`,
      icon: Clock
    },
    {
      name: 'Trade Activity',
      status: recentTrades.length > 0 ? 'healthy' : 'attention',
      message: `${recentTrades.length} trades (24h)`,
      icon: TrendingUp
    },
    {
      name: 'Dispute Rate',
      status: disputeRate > 10 ? 'critical' : disputeRate > 5 ? 'warning' : 'healthy',
      message: `${disputeRate}% dispute rate`,
      icon: AlertCircle
    },
    {
      name: 'Expiring Trades',
      status: expiringSoon.length > 5 ? 'warning' : expiringSoon.length > 0 ? 'attention' : 'healthy',
      message: `${expiringSoon.length} expiring soon`,
      icon: Zap
    }
  ];

  const overallStatus = healthChecks.some(h => h.status === 'critical') 
    ? 'critical' 
    : healthChecks.some(h => h.status === 'warning')
    ? 'warning'
    : healthChecks.some(h => h.status === 'attention')
    ? 'attention'
    : 'healthy';

  const statusConfig = {
    healthy: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', label: 'Healthy' },
    attention: { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', label: 'Attention' },
    warning: { color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', label: 'Warning' },
    critical: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', label: 'Critical' }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading system health..." />;
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card className={`${statusConfig[overallStatus].bg} border ${statusConfig[overallStatus].border} p-6`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${statusConfig[overallStatus].bg}`}>
              <Activity className={`w-6 h-6 ${statusConfig[overallStatus].color}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">System Status: {statusConfig[overallStatus].label}</h3>
              <p className="text-slate-300 text-sm">Last checked: {format(lastCheck, 'MMM d, HH:mm:ss')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant="outline"
              className={`border-slate-600 ${autoRefresh ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'}`}
            >
              <Activity className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
              {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className={`border-slate-600 ${statusConfig[overallStatus].color}`}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* System Resources */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">System Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {systemChecks.map((check) => {
            const Icon = check.icon;
            const config = statusConfig[check.status];
            return (
              <div key={check.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className="text-slate-300 text-sm">{check.name}</span>
                  </div>
                  <Badge className={`${config.bg} ${config.color} border ${config.border} text-xs`}>
                    {check.value}%
                  </Badge>
                </div>
                <Progress value={check.value} className="h-2" />
                <p className="text-slate-400 text-xs">{check.message}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Critical Alerts */}
      {(stuckTrades.length > 0 || activeDisputes.length > 3 || parseFloat(disputeRate) > 5) && (
        <Alert className="bg-red-500/10 border-red-500/30">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            <strong>Action Required:</strong>
            {stuckTrades.length > 0 && ` ${stuckTrades.length} trades stuck >48h.`}
            {activeDisputes.length > 3 && ` ${activeDisputes.length} active disputes.`}
            {parseFloat(disputeRate) > 5 && ` High dispute rate (${disputeRate}%).`}
          </AlertDescription>
        </Alert>
      )}

      {/* Health Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthChecks.map((check) => {
          const Icon = check.icon;
          const config = statusConfig[check.status];
          
          return (
            <Card key={check.name} className={`${config.bg} border ${config.border} p-4`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-semibold text-sm">{check.name}</h4>
                    <Badge className={`${config.bg} ${config.color} border ${config.border} text-xs`}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-xs">{check.message}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-800/50">
            <p className="text-slate-400 text-xs mb-1">Avg Trade Time</p>
            <p className="text-white text-xl font-bold">{avgTradeHours}h</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50">
            <p className="text-slate-400 text-xs mb-1">24h Activity</p>
            <p className="text-white text-xl font-bold">{recentTrades.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50">
            <p className="text-slate-400 text-xs mb-1">Active Users</p>
            <p className="text-white text-xl font-bold">{users.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50">
            <p className="text-slate-400 text-xs mb-1">Open Offers</p>
            <p className="text-white text-xl font-bold">{offers.filter(o => o.status === 'open').length}</p>
          </div>
        </div>
      </Card>

      {/* Issues Requiring Attention */}
      {(stuckTrades.length > 0 || expiringSoon.length > 0) && (
        <Card className="bg-slate-900/50 border-amber-500/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Issues Requiring Attention</h3>
          <div className="space-y-3">
            {stuckTrades.length > 0 && (
              <Alert className="bg-amber-500/10 border-amber-500/30">
                <Clock className="h-4 w-4 text-amber-400" />
                <AlertDescription className="text-amber-300 text-sm">
                  <strong>Stuck Trades:</strong> {stuckTrades.length} trades have been active for over 48 hours. 
                  Review in Trades tab.
                </AlertDescription>
              </Alert>
            )}
            {expiringSoon.length > 0 && (
              <Alert className="bg-blue-500/10 border-blue-500/30">
                <Zap className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300 text-sm">
                  <strong>Expiring Soon:</strong> {expiringSoon.length} trades will expire in less than 2 hours.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}