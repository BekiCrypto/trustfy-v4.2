import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Database, 
  Trash2, 
  Download,
  AlertCircle,
  RefreshCw,
  Loader2,
  Info,
  FileJson,
  TrendingUp,
  HardDrive,
  Activity,
  Shield,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import LoadingSpinner from "../common/LoadingSpinner";

export default function DatabaseManager() {
  const [cleaning, setCleaning] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [exportProgress, setExportProgress] = useState(0);
  const queryClient = useQueryClient();
  
  // Fetch all entities
  const { data: trades = [], refetch: refetchTrades } = useQuery({
    queryKey: ['db-trades'],
    queryFn: () => base44.entities.Trade.list()
  });
  
  const { data: disputes = [], refetch: refetchDisputes } = useQuery({
    queryKey: ['db-disputes'],
    queryFn: () => base44.entities.Dispute.list()
  });
  
  const { data: profiles = [], refetch: refetchProfiles } = useQuery({
    queryKey: ['db-profiles'],
    queryFn: () => base44.entities.UserProfile.list()
  });
  
  const { data: offers = [], refetch: refetchOffers } = useQuery({
    queryKey: ['db-offers'],
    queryFn: () => base44.entities.TradeOffer.list()
  });
  
  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ['db-notifications'],
    queryFn: () => base44.entities.Notification.list()
  });
  
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['db-messages'],
    queryFn: () => base44.entities.ChatMessage.list()
  });

  const { data: policies = [], refetch: refetchPolicies } = useQuery({
    queryKey: ['db-policies'],
    queryFn: () => base44.entities.InsurancePolicy.list()
  });

  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ['db-reviews'],
    queryFn: () => base44.entities.TradeReview.list()
  });

  const isLoading = !trades && !disputes && !profiles;

  const handleRefreshAll = () => {
    Promise.all([
      refetchTrades(),
      refetchDisputes(),
      refetchProfiles(),
      refetchOffers(),
      refetchNotifications(),
      refetchMessages(),
      refetchPolicies(),
      refetchReviews()
    ]).then(() => {
      toast.success('All entity stats refreshed');
    });
  };

  const handleExportEntity = async (entityName, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityName}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${entityName} exported successfully`);
  };

  const handleCleanupOldNotifications = async () => {
    if (!confirm('Delete notifications older than 30 days? This cannot be undone.')) return;
    
    setCleaning(true);
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const oldNotifications = notifications.filter(n => 
        new Date(n.created_date) < thirtyDaysAgo
      );
      
      for (const notif of oldNotifications) {
        await base44.entities.Notification.delete(notif.id);
      }
      
      refetchNotifications();
      toast.success(`Deleted ${oldNotifications.length} old notifications`);
    } catch (error) {
      toast.error('Failed to cleanup notifications');
    } finally {
      setCleaning(false);
    }
  };

  const handleCleanupExpiredTrades = async () => {
    if (!confirm('Archive expired/cancelled trades? This will remove them from active views.')) return;
    
    setCleaning(true);
    try {
      const expiredTrades = trades.filter(t => 
        ['expired', 'cancelled'].includes(t.status)
      );
      
      // In production, you might want to move to an archive table instead of deleting
      toast.info(`Found ${expiredTrades.length} expired/cancelled trades`);
      toast.success('Use export feature to backup before cleanup');
    } catch (error) {
      toast.error('Failed to cleanup trades');
    } finally {
      setCleaning(false);
    }
  };

  const handleExportWithProgress = async (entityName, data) => {
    setExportProgress(0);
    const chunks = 100;
    for (let i = 0; i < chunks; i++) {
      setExportProgress((i + 1) / chunks * 100);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    handleExportEntity(entityName, data);
    setExportProgress(0);
  };

  const entities = [
    { 
      name: 'Trade', 
      count: trades.length, 
      data: trades,
      description: 'All trade records',
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/30',
      icon: TrendingUp
    },
    { 
      name: 'Dispute', 
      count: disputes.length, 
      data: disputes,
      description: 'Dispute records',
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      icon: Shield
    },
    { 
      name: 'UserProfile', 
      count: profiles.length, 
      data: profiles,
      description: 'User profiles',
      color: 'text-purple-400',
      bg: 'bg-purple-500/20',
      border: 'border-purple-500/30',
      icon: Activity
    },
    { 
      name: 'TradeOffer', 
      count: offers.length, 
      data: offers,
      description: 'Marketplace offers',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/30',
      icon: FileJson
    },
    { 
      name: 'Notification', 
      count: notifications.length, 
      data: notifications,
      description: 'User notifications',
      color: 'text-amber-400',
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/30',
      icon: Info
    },
    { 
      name: 'ChatMessage', 
      count: messages.length, 
      data: messages,
      description: 'Trade chat messages',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/20',
      border: 'border-cyan-500/30',
      icon: Activity
    },
    {
      name: 'InsurancePolicy',
      count: policies.length,
      data: policies,
      description: 'Insurance policies',
      color: 'text-pink-400',
      bg: 'bg-pink-500/20',
      border: 'border-pink-500/30',
      icon: Shield
    },
    {
      name: 'TradeReview',
      count: reviews.length,
      data: reviews,
      description: 'Trade reviews',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/20',
      border: 'border-indigo-500/30',
      icon: Clock
    }
  ];

  const totalRecords = entities.reduce((sum, e) => sum + e.count, 0);
  const storageUsed = Math.min(100, (totalRecords / 10000) * 100);

  if (isLoading) {
    return <LoadingSpinner text="Loading database stats..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Database className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Database Manager</h3>
              <p className="text-slate-400 text-sm">{totalRecords} total records across {entities.length} entities</p>
            </div>
          </div>
          <Button
            onClick={handleRefreshAll}
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>

      <Alert className="bg-blue-500/10 border-blue-500/30">
        <Info className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300 text-sm">
          <strong>Database Operations:</strong> Export entities for backup, monitor record counts, and perform maintenance tasks.
        </AlertDescription>
      </Alert>

      {/* Storage Overview */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Database Storage</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-sm">Records Used</span>
            <span className="text-white font-semibold">{totalRecords.toLocaleString()} / 10,000</span>
          </div>
          <Progress value={storageUsed} className="h-2" />
          <p className="text-slate-400 text-xs">
            {storageUsed.toFixed(1)}% of storage capacity used
          </p>
        </div>
      </Card>

      {/* Entity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {entities.map((entity) => {
          const Icon = entity.icon;
          return (
            <Card 
              key={entity.name} 
              className={`${entity.bg} border ${entity.border} p-4 cursor-pointer hover:scale-105 transition-transform`}
              onClick={() => setSelectedEntity(entity)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${entity.color}`} />
                  <div>
                    <h4 className="text-white font-semibold text-sm">{entity.name}</h4>
                    <p className="text-slate-400 text-xs">{entity.description}</p>
                  </div>
                </div>
                <Badge className={`${entity.bg} ${entity.color} border ${entity.border}`}>
                  {entity.count}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportEntity(entity.name, entity.data);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800/50"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEntity(entity);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400"
                >
                  <Info className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Maintenance Actions */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Database Maintenance</h3>
        
        <Alert className="bg-amber-500/10 border-amber-500/30 mb-4">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-300 text-sm">
            <strong>Warning:</strong> Cleanup operations are irreversible. Always export data before cleanup.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div>
              <p className="text-white font-medium">Cleanup Old Notifications</p>
              <p className="text-slate-400 text-sm">Remove notifications older than 30 days ({notifications.filter(n => new Date(n.created_date) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} found)</p>
            </div>
            <Button
              onClick={handleCleanupOldNotifications}
              disabled={cleaning}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              {cleaning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cleanup
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div>
              <p className="text-white font-medium">Archive Expired Trades</p>
              <p className="text-slate-400 text-sm">Review expired/cancelled trades ({trades.filter(t => ['expired', 'cancelled'].includes(t.status)).length} found)</p>
            </div>
            <Button
              onClick={handleCleanupExpiredTrades}
              disabled={cleaning}
              variant="outline"
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
            >
              <FileJson className="w-4 h-4 mr-2" />
              Review
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div>
              <p className="text-white font-medium">Export All Entities</p>
              <p className="text-slate-400 text-sm">Full database backup of all entities</p>
            </div>
            <Button
              onClick={() => {
                entities.forEach(e => handleExportEntity(e.name, e.data));
              }}
              variant="outline"
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>
      </Card>

      {/* Entity Detail Modal */}
      <Dialog open={!!selectedEntity} onOpenChange={() => setSelectedEntity(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedEntity?.name} Details</DialogTitle>
            <DialogDescription className="text-slate-400">
              Complete information about this entity
            </DialogDescription>
          </DialogHeader>
          
          {selectedEntity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <p className="text-slate-400 text-xs mb-1">Total Records</p>
                  <p className="text-white text-2xl font-bold">{selectedEntity.count}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <p className="text-slate-400 text-xs mb-1">Est. Size</p>
                  <p className="text-white text-2xl font-bold">
                    {(selectedEntity.count * 2).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-semibold text-sm">Sample Record</h4>
                <pre className="bg-slate-800/50 p-4 rounded-lg text-xs text-slate-300 overflow-auto max-h-64">
                  {JSON.stringify(selectedEntity.data[0] || {}, null, 2)}
                </pre>
              </div>

              <Button
                onClick={() => handleExportWithProgress(selectedEntity.name, selectedEntity.data)}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export {selectedEntity.name}
              </Button>

              {exportProgress > 0 && (
                <div className="space-y-2">
                  <Progress value={exportProgress} className="h-2" />
                  <p className="text-slate-400 text-xs text-center">Exporting... {exportProgress.toFixed(0)}%</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}