import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Shield,
  Ban,
  Eye,
  Clock,
  TrendingUp,
  Activity,
  UserX,
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  Flag,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import ConfirmDialog from "../common/ConfirmDialog";

export default function SecurityMonitoring() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [banReason, setBanReason] = useState('');

  // Fetch all data for security monitoring
  const { data: profiles = [] } = useQuery({
    queryKey: ['all-profiles-security'],
    queryFn: () => base44.asServiceRole.entities.UserProfile.list('-created_date', 200)
  });

  const { data: trades = [] } = useQuery({
    queryKey: ['all-trades-security'],
    queryFn: () => base44.asServiceRole.entities.Trade.list('-created_date', 500)
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ['all-disputes-security'],
    queryFn: () => base44.asServiceRole.entities.Dispute.list('-created_date', 200)
  });

  const { data: offers = [] } = useQuery({
    queryKey: ['all-offers-security'],
    queryFn: () => base44.asServiceRole.entities.TradeOffer.list('-created_date', 200)
  });

  // Ban/Suspend User Mutation
  const banUser = useMutation({
    mutationFn: async ({ userId, reason }) => {
      return await base44.asServiceRole.entities.UserProfile.update(userId, {
        platform_role: 'banned',
        ban_reason: reason,
        banned_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-profiles-security'] });
      toast.success('User banned successfully');
      setShowBanDialog(false);
      setSelectedUser(null);
      setBanReason('');
    },
    onError: (error) => {
      toast.error('Failed to ban user: ' + error.message);
    }
  });

  // Detect suspicious activities
  const detectSuspiciousActivities = () => {
    const suspicious = [];

    profiles.forEach(profile => {
      const userTrades = trades.filter(t => 
        t.seller_address === profile.wallet_address || 
        t.buyer_address === profile.wallet_address
      );
      const userDisputes = disputes.filter(d => d.initiator_address === profile.wallet_address);
      
      // High dispute rate (>30%)
      if (userTrades.length > 5 && userDisputes.length / userTrades.length > 0.3) {
        suspicious.push({
          type: 'high_dispute_rate',
          severity: 'high',
          user: profile,
          details: `${userDisputes.length}/${userTrades.length} trades disputed (${((userDisputes.length / userTrades.length) * 100).toFixed(0)}%)`,
          timestamp: new Date()
        });
      }

      // Multiple failed trades
      const failedTrades = userTrades.filter(t => ['cancelled', 'expired'].includes(t.status));
      if (failedTrades.length > 10) {
        suspicious.push({
          type: 'high_failure_rate',
          severity: 'medium',
          user: profile,
          details: `${failedTrades.length} failed trades`,
          timestamp: new Date()
        });
      }

      // Low reputation with high volume
      if (profile.reputation_score < 300 && profile.total_volume > 50000) {
        suspicious.push({
          type: 'low_rep_high_volume',
          severity: 'high',
          user: profile,
          details: `Rep: ${profile.reputation_score}, Volume: $${profile.total_volume.toLocaleString()}`,
          timestamp: new Date()
        });
      }

      // Multiple offers created recently (potential spam)
      const userOffers = offers.filter(o => o.creator_address === profile.wallet_address);
      const recentOffers = userOffers.filter(o => {
        const createdDate = new Date(o.created_date);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return createdDate > dayAgo;
      });
      if (recentOffers.length > 20) {
        suspicious.push({
          type: 'spam_offers',
          severity: 'medium',
          user: profile,
          details: `${recentOffers.length} offers in 24h`,
          timestamp: new Date()
        });
      }

      // Unusual trade patterns (rapid sequential trades)
      const last24hTrades = userTrades.filter(t => {
        const tradeDate = new Date(t.created_date);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return tradeDate > dayAgo;
      });
      if (last24hTrades.length > 15) {
        suspicious.push({
          type: 'unusual_activity',
          severity: 'high',
          user: profile,
          details: `${last24hTrades.length} trades in 24h`,
          timestamp: new Date()
        });
      }
    });

    return suspicious.sort((a, b) => 
      (b.severity === 'high' ? 2 : 1) - (a.severity === 'high' ? 2 : 1)
    );
  };

  const suspiciousActivities = detectSuspiciousActivities();
  const highSeverity = suspiciousActivities.filter(a => a.severity === 'high');
  const mediumSeverity = suspiciousActivities.filter(a => a.severity === 'medium');

  // Calculate platform health metrics
  const totalDisputes = disputes.length;
  const resolvedDisputes = disputes.filter(d => d.status === 'resolved').length;
  const disputeResolutionRate = totalDisputes > 0 ? (resolvedDisputes / totalDisputes * 100).toFixed(0) : 100;
  
  const totalTrades = trades.length;
  const completedTrades = trades.filter(t => t.status === 'completed').length;
  const successRate = totalTrades > 0 ? (completedTrades / totalTrades * 100).toFixed(0) : 100;

  const avgDisputesPerUser = profiles.length > 0 ? (totalDisputes / profiles.length).toFixed(2) : 0;

  const severityConfig = {
    high: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: AlertTriangle },
    medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: Flag },
    low: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Eye }
  };

  const typeLabels = {
    high_dispute_rate: 'High Dispute Rate',
    high_failure_rate: 'High Failure Rate',
    low_rep_high_volume: 'Low Rep / High Volume',
    spam_offers: 'Potential Spam',
    unusual_activity: 'Unusual Activity'
  };

  const filteredActivities = suspiciousActivities.filter(activity =>
    activity.user.wallet_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.user.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-700/50 p-5">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Critical</Badge>
          </div>
          <p className="text-slate-400 text-sm mb-1">High Risk Alerts</p>
          <p className="text-3xl font-bold text-white">{highSeverity.length}</p>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/20 border-amber-700/50 p-5">
          <div className="flex items-center justify-between mb-2">
            <Flag className="w-5 h-5 text-amber-400" />
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Medium</Badge>
          </div>
          <p className="text-slate-400 text-sm mb-1">Suspicious Activities</p>
          <p className="text-3xl font-bold text-white">{mediumSeverity.length}</p>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 border-emerald-700/50 p-5">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Health</Badge>
          </div>
          <p className="text-slate-400 text-sm mb-1">Success Rate</p>
          <p className="text-3xl font-bold text-white">{successRate}%</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/50 p-5">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Avg</Badge>
          </div>
          <p className="text-slate-400 text-sm mb-1">Disputes Per User</p>
          <p className="text-3xl font-bold text-white">{avgDisputesPerUser}</p>
        </Card>
      </div>

      {/* Security Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="bg-slate-900/50 border border-slate-700/50">
          <TabsTrigger value="alerts">Security Alerts ({suspiciousActivities.length})</TabsTrigger>
          <TabsTrigger value="users">High Risk Users</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Security Alerts */}
        <TabsContent value="alerts">
          <Card className="bg-slate-900/90 border-slate-700/50 p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">Security Alerts</h3>
              <p className="text-slate-400 text-sm mb-4">Real-time detection of suspicious activities</p>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search alerts by user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700"
                />
              </div>
            </div>

            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">All Clear!</h4>
                <p className="text-slate-400">No suspicious activities detected</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActivities.map((activity, idx) => {
                  const config = severityConfig[activity.severity];
                  const Icon = config.icon;
                  
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${config.border} ${config.bg}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Icon className={`w-5 h-5 ${config.color} mt-1`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-semibold ${config.color}`}>
                                {typeLabels[activity.type]}
                              </h4>
                              <Badge className={`${config.bg} ${config.color} border ${config.border} text-xs`}>
                                {activity.severity}
                              </Badge>
                            </div>
                            <p className="text-white text-sm mb-1">
                              User: {activity.user.display_name || 'Anonymous'} ({activity.user.wallet_address?.slice(0, 8)}...)
                            </p>
                            <p className="text-slate-400 text-sm">{activity.details}</p>
                            <p className="text-slate-500 text-xs mt-2">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Detected {format(activity.timestamp, 'PPpp')}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedUser(activity.user);
                            setShowBanDialog(true);
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Ban
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* High Risk Users */}
        <TabsContent value="users">
          <Card className="bg-slate-900/90 border-slate-700/50 p-6">
            <h3 className="text-xl font-bold text-white mb-4">High Risk Users</h3>
            
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">User</TableHead>
                  <TableHead className="text-slate-300">Risk Level</TableHead>
                  <TableHead className="text-slate-300">Disputes</TableHead>
                  <TableHead className="text-slate-300">Failed Trades</TableHead>
                  <TableHead className="text-slate-300">Reputation</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles
                  .filter(p => {
                    const userDisputes = disputes.filter(d => d.initiator_address === p.wallet_address);
                    const userTrades = trades.filter(t => t.seller_address === p.wallet_address || t.buyer_address === p.wallet_address);
                    return (
                      (userDisputes.length > 3) ||
                      (p.reputation_score < 400 && userTrades.length > 5) ||
                      (p.disputed_trades > 5)
                    );
                  })
                  .slice(0, 20)
                  .map(profile => {
                    const userTrades = trades.filter(t => t.seller_address === profile.wallet_address || t.buyer_address === profile.wallet_address);
                    const userDisputes = disputes.filter(d => d.initiator_address === profile.wallet_address);
                    const failedTrades = userTrades.filter(t => ['cancelled', 'expired'].includes(t.status)).length;
                    const disputeRate = userTrades.length > 0 ? (userDisputes.length / userTrades.length) : 0;
                    
                    const riskLevel = disputeRate > 0.3 ? 'high' : disputeRate > 0.15 ? 'medium' : 'low';
                    const riskConfig = {
                      high: { label: 'High Risk', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
                      medium: { label: 'Medium Risk', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
                      low: { label: 'Low Risk', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' }
                    }[riskLevel];

                    return (
                      <TableRow key={profile.id} className="border-slate-700">
                        <TableCell>
                          <div>
                            <p className="text-white font-medium">{profile.display_name || 'Anonymous'}</p>
                            <p className="text-slate-500 text-xs font-mono">
                              {profile.wallet_address?.slice(0, 8)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${riskConfig.bg} ${riskConfig.color} border ${riskConfig.border}`}>
                            {riskConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-white">{userDisputes.length}</span>
                          <span className="text-slate-500 text-sm ml-1">
                            ({(disputeRate * 100).toFixed(0)}%)
                          </span>
                        </TableCell>
                        <TableCell className="text-white">{failedTrades}</TableCell>
                        <TableCell>
                          <span className={profile.reputation_score < 400 ? 'text-red-400' : 'text-white'}>
                            {profile.reputation_score || 500}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedUser(profile);
                              setShowBanDialog(true);
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Ban
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit">
          <Card className="bg-slate-900/90 border-slate-700/50 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Admin Actions</h3>
            <p className="text-slate-400 text-sm">This feature will log all administrative actions taken on the platform</p>
            <div className="mt-8 text-center py-12">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500">Audit logging will be implemented in production</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ban User Dialog */}
      <ConfirmDialog
        open={showBanDialog}
        onOpenChange={setShowBanDialog}
        onConfirm={() => {
          if (!banReason.trim()) {
            toast.error('Please provide a reason for banning');
            return;
          }
          banUser.mutate({ userId: selectedUser.id, reason: banReason });
        }}
        title="Ban User?"
        description={
          <div className="space-y-3">
            <p>Are you sure you want to ban {selectedUser?.display_name || 'this user'}?</p>
            <Input
              placeholder="Reason for ban (required)"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="bg-slate-800 border-slate-700"
            />
          </div>
        }
        confirmText={banUser.isPending ? "Banning..." : "Ban User"}
        variant="destructive"
      />
    </div>
  );
}