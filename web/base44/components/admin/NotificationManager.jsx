import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Send, 
  Users,
  AlertCircle,
  Megaphone,
  Loader2,
  CheckCircle,
  Filter,
  TrendingUp,
  Eye,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createNotification } from "../notifications/notificationHelpers";
import LoadingSpinner from "../common/LoadingSpinner";

export default function NotificationManager() {
  const [broadcastMessage, setBroadcastMessage] = useState({
    title: '',
    message: '',
    priority: 'medium',
    type: 'system'
  });
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [filterRole, setFilterRole] = useState('all');
  const [filterTier, setFilterTier] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const queryClient = useQueryClient();
  
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.UserProfile.list()
  });
  
  const { data: recentNotifications = [] } = useQuery({
    queryKey: ['recent-notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 50)
  });

  const filteredUsers = users.filter(u => {
    const matchesRole = filterRole === 'all' || u.platform_role === filterRole;
    const matchesTier = filterTier === 'all' || u.reputation_tier === filterTier;
    return matchesRole && matchesTier;
  });

  const handleBroadcast = async () => {
    if (!broadcastMessage.title || !broadcastMessage.message) {
      toast.error('Please fill in title and message');
      return;
    }

    const targetUsers = filteredUsers.length > 0 ? filteredUsers : users;
    if (!confirm(`Send notification to ${targetUsers.length} users?`)) return;

    setSending(true);
    setSendProgress(0);
    try {
      let sent = 0;
      for (const user of targetUsers) {
        await createNotification({
          userAddress: user.wallet_address,
          type: broadcastMessage.type,
          title: broadcastMessage.title,
          message: broadcastMessage.message,
          priority: broadcastMessage.priority
        });
        sent++;
        setSendProgress((sent / targetUsers.length) * 100);
      }
      
      toast.success(`Broadcast sent to ${sent} users`);
      setBroadcastMessage({ title: '', message: '', priority: 'medium', type: 'system' });
      queryClient.invalidateQueries({ queryKey: ['recent-notifications'] });
    } catch (error) {
      toast.error('Failed to send broadcast');
    } finally {
      setSending(false);
      setSendProgress(0);
    }
  };

  const notificationStats = {
    total: recentNotifications.length,
    unread: recentNotifications.filter(n => !n.is_read).length,
    high: recentNotifications.filter(n => n.priority === 'high' || n.priority === 'critical').length,
    byType: recentNotifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {})
  };

  const filteredNotifications = recentNotifications.filter(n => {
    return priorityFilter === 'all' || n.priority === priorityFilter;
  });

  if (loadingUsers) {
    return <LoadingSpinner text="Loading notification manager..." />;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50 p-4">
          <p className="text-slate-400 text-xs mb-1">Total Users</p>
          <p className="text-white text-2xl font-bold">{users.length}</p>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30 p-4">
          <p className="text-blue-400 text-xs mb-1">Recent Notifications</p>
          <p className="text-white text-2xl font-bold">{notificationStats.total}</p>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30 p-4">
          <p className="text-amber-400 text-xs mb-1">Unread</p>
          <p className="text-white text-2xl font-bold">{notificationStats.unread}</p>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30 p-4">
          <p className="text-red-400 text-xs mb-1">High Priority</p>
          <p className="text-white text-2xl font-bold">{notificationStats.high}</p>
        </Card>
      </div>

      {/* Broadcast Notification */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Megaphone className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Broadcast Notification</h3>
            <p className="text-slate-400 text-sm">Send notification to all users</p>
          </div>
        </div>

        <Alert className="bg-amber-500/10 border-amber-500/30 mb-4">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-300 text-sm">
            Target: {filteredUsers.length > 0 ? filteredUsers.length : users.length} users 
            {(filterRole !== 'all' || filterTier !== 'all') && ' (filtered)'}
          </AlertDescription>
        </Alert>

        {/* User Filters */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <Label className="text-slate-300 text-xs">Filter by Role</Label>
            <Tabs value={filterRole} onValueChange={setFilterRole} className="mt-1">
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="user">Users</TabsTrigger>
                <TabsTrigger value="admin">Admins</TabsTrigger>
                <TabsTrigger value="arbitrator">Arbitrators</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex-1">
            <Label className="text-slate-300 text-xs">Filter by Tier</Label>
            <Tabs value={filterTier} onValueChange={setFilterTier} className="mt-1">
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="platinum">Platinum</TabsTrigger>
                <TabsTrigger value="gold">Gold</TabsTrigger>
                <TabsTrigger value="silver">Silver</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-slate-300">Title</Label>
            <Input
              value={broadcastMessage.title}
              onChange={(e) => setBroadcastMessage({...broadcastMessage, title: e.target.value})}
              placeholder="e.g., Platform Maintenance Notice"
              className="bg-slate-800 border-slate-700 mt-1"
            />
          </div>

          <div>
            <Label className="text-slate-300">Message</Label>
            <Textarea
              value={broadcastMessage.message}
              onChange={(e) => setBroadcastMessage({...broadcastMessage, message: e.target.value})}
              placeholder="Enter your message here..."
              className="bg-slate-800 border-slate-700 mt-1 min-h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Priority</Label>
              <select
                value={broadcastMessage.priority}
                onChange={(e) => setBroadcastMessage({...broadcastMessage, priority: e.target.value})}
                className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <Label className="text-slate-300">Type</Label>
              <select
                value={broadcastMessage.type}
                onChange={(e) => setBroadcastMessage({...broadcastMessage, type: e.target.value})}
                className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="system">System</option>
                <option value="trade_match">Trade Match</option>
                <option value="status_change">Status Change</option>
                <option value="dispute">Dispute</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleBroadcast}
            disabled={sending || !broadcastMessage.title || !broadcastMessage.message}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending... {sendProgress.toFixed(0)}%
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send to {filteredUsers.length > 0 ? filteredUsers.length : users.length} Users
              </>
            )}
          </Button>

          {sending && (
            <Progress value={sendProgress} className="h-2" />
          )}
        </div>
      </Card>

      {/* Recent Notifications */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Notifications (Last 50)</h3>
          <Tabs value={priorityFilter} onValueChange={setPriorityFilter}>
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="critical">Critical</TabsTrigger>
              <TabsTrigger value="high">High</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredNotifications.map((notif) => (
            <div key={notif.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={
                      notif.priority === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      notif.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }>
                      {notif.priority}
                    </Badge>
                    <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                      {notif.type}
                    </Badge>
                    {!notif.is_read && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                        Unread
                      </Badge>
                    )}
                  </div>
                  <p className="text-white font-medium text-sm">{notif.title}</p>
                  <p className="text-slate-400 text-xs mt-1">{notif.message}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    To: {notif.user_address?.slice(0, 10)}... • {new Date(notif.created_date).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Notification Type Breakdown */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Notification Types Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(notificationStats.byType).map(([type, count]) => (
            <div key={type} className="p-3 rounded-lg bg-slate-800/50">
              <p className="text-slate-400 text-xs capitalize">{type.replace(/_/g, ' ')}</p>
              <p className="text-white text-lg font-bold">{count}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}