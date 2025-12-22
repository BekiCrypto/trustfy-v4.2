import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  Shield, 
  Crown, 
  Scale, 
  User, 
  Edit2, 
  Loader2, 
  Ban, 
  CheckCircle, 
  Download,
  Eye,
  TrendingUp,
  AlertTriangle,
  Filter,
  Trash2,
  Users,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import ReputationBadge from "../common/ReputationBadge";
import WalletAddress from "../common/WalletAddress";

export default function UserManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewingUser, setViewingUser] = useState(null);
  const [sortBy, setSortBy] = useState('-created_date');

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['all-profiles', sortBy],
    queryFn: async () => {
      const profiles = await base44.asServiceRole.entities.UserProfile.list(sortBy, 500);
      const users = await base44.asServiceRole.entities.User.list();
      
      // Create a map of existing profile wallet addresses
      const profileMap = new Map(profiles.map(p => [p.wallet_address, p]));
      
      // Add users who don't have profiles yet
      const allProfiles = [...profiles];
      for (const user of users) {
        if (!profileMap.has(user.email)) {
          allProfiles.push({
            wallet_address: user.email,
            display_name: user.full_name || 'Unnamed User',
            platform_role: user.role === 'admin' ? 'admin' : 'user',
            reputation_score: 500,
            reputation_tier: 'new',
            total_trades: 0,
            successful_trades: 0,
            kyc_status: 'none',
            created_date: new Date().toISOString(),
            _is_user_only: true
          });
        }
      }
      
      return allProfiles;
    }
  });

  const { data: trades = [] } = useQuery({
    queryKey: ['all-trades-count'],
    queryFn: () => base44.entities.Trade.list()
  });

  const updateRole = useMutation({
    mutationFn: ({ profileId, platform_role }) => 
      base44.asServiceRole.entities.UserProfile.update(profileId, { platform_role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['all-profiles-security'] });
      toast.success('User role updated successfully');
      setEditingUser(null);
      setNewRole('');
    },
    onError: (error) => {
      toast.error('Failed to update role: ' + error.message);
    }
  });

  const suspendUser = useMutation({
    mutationFn: ({ profileId }) => 
      base44.asServiceRole.entities.UserProfile.update(profileId, { 
        platform_role: 'suspended',
        suspended_at: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['all-profiles-security'] });
      toast.success('User suspended successfully');
    },
    onError: (error) => {
      toast.error('Failed to suspend user: ' + error.message);
    }
  });

  const activateUser = useMutation({
    mutationFn: ({ profileId, originalRole }) => 
      base44.asServiceRole.entities.UserProfile.update(profileId, { 
        platform_role: originalRole || 'user',
        suspended_at: null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['all-profiles-security'] });
      toast.success('User activated successfully');
    },
    onError: (error) => {
      toast.error('Failed to activate user: ' + error.message);
    }
  });

  const adjustReputation = useMutation({
    mutationFn: ({ profileId, newScore }) =>
      base44.asServiceRole.entities.UserProfile.update(profileId, { reputation_score: newScore }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-profiles'] });
      toast.success('Reputation score updated');
    }
  });

  const verifyKYC = useMutation({
    mutationFn: ({ profileId, status }) =>
      base44.asServiceRole.entities.UserProfile.update(profileId, { kyc_status: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-profiles'] });
      toast.success('KYC status updated');
    }
  });

  const bulkSuspend = useMutation({
    mutationFn: async (userIds) => {
      for (const id of userIds) {
        await base44.asServiceRole.entities.UserProfile.update(id, {
          platform_role: 'suspended',
          suspended_at: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-profiles'] });
      setSelectedUsers([]);
      toast.success('Users suspended successfully');
    }
  });

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = 
      profile.wallet_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || profile.platform_role === roleFilter;
    const matchesKYC = kycFilter === 'all' || profile.kyc_status === kycFilter;
    const matchesTier = tierFilter === 'all' || profile.reputation_tier === tierFilter;
    
    return matchesSearch && matchesRole && matchesKYC && matchesTier;
  });

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Reputation', 'Tier', 'Total Trades', 'Successful Trades', 'KYC Status', 'Joined'].join(','),
      ...filteredProfiles.map(p => [
        p.display_name,
        p.wallet_address,
        p.platform_role,
        p.reputation_score || 0,
        p.reputation_tier || 'new',
        p.total_trades || 0,
        p.successful_trades || 0,
        p.kyc_status || 'none',
        p.created_date ? new Date(p.created_date).toLocaleDateString() : 'N/A'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Users exported to CSV');
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedUsers.length === filteredProfiles.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredProfiles.map(p => p.id).filter(Boolean));
    }
  };

  const handleUpdateRole = (profile) => {
    if (!newRole) {
      toast.error('Please select a role');
      return;
    }
    updateRole.mutate({ profileId: profile.id, platform_role: newRole });
  };

  const roleIcons = {
    super_admin: { icon: Crown, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
    admin: { icon: Shield, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
    arbitrator: { icon: Scale, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
    user: { icon: User, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' }
  };

  return (
    <Card className="bg-slate-900/90 border-slate-700/50 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{t('admin.userManagement')}</h2>
        <p className="text-slate-400">{t('admin.manageRolesPermissions')}</p>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Alert className="mb-4 bg-blue-500/10 border-blue-500/30">
          <Users className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300 text-sm flex items-center justify-between">
            <span>{selectedUsers.length} users selected</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => bulkSuspend.mutate(selectedUsers)}
                disabled={bulkSuspend.isPending}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <Ban className="w-3 h-3 mr-1" />
                Suspend All
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedUsers([])}
                className="text-slate-400"
              >
                Clear
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder={t('admin.searchByWalletOrName')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleExport}
            className="border-slate-600 text-slate-300"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <Tabs value={roleFilter} onValueChange={setRoleFilter}>
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="all">All Roles</TabsTrigger>
                <TabsTrigger value="user">Users</TabsTrigger>
                <TabsTrigger value="admin">Admins</TabsTrigger>
                <TabsTrigger value="arbitrator">Arbitrators</TabsTrigger>
                <TabsTrigger value="suspended">Suspended</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Tabs value={kycFilter} onValueChange={setKycFilter}>
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger value="all">All KYC</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="none">None</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={tierFilter} onValueChange={setTierFilter}>
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger value="all">All Tiers</TabsTrigger>
              <TabsTrigger value="platinum">Platinum</TabsTrigger>
              <TabsTrigger value="gold">Gold</TabsTrigger>
              <TabsTrigger value="silver">Silver</TabsTrigger>
              <TabsTrigger value="bronze">Bronze</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="-created_date">Newest First</SelectItem>
              <SelectItem value="created_date">Oldest First</SelectItem>
              <SelectItem value="-reputation_score">Highest Reputation</SelectItem>
              <SelectItem value="reputation_score">Lowest Reputation</SelectItem>
              <SelectItem value="-total_trades">Most Trades</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <p className="text-slate-400 text-sm mb-1">{t('admin.totalUsersLabel')}</p>
          <p className="text-2xl font-bold text-white">{profiles.length}</p>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30 p-4">
          <p className="text-blue-400 text-sm mb-1">{t('admin.adminsLabel')}</p>
          <p className="text-2xl font-bold text-white">
            {profiles.filter(p => ['admin', 'super_admin'].includes(p.platform_role)).length}
          </p>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30 p-4">
          <p className="text-purple-400 text-sm mb-1">{t('admin.arbitratorsLabel')}</p>
          <p className="text-2xl font-bold text-white">
            {profiles.filter(p => p.platform_role === 'arbitrator').length}
          </p>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30 p-4">
          <p className="text-emerald-400 text-sm mb-1">{t('admin.kycVerifiedLabel')}</p>
          <p className="text-2xl font-bold text-white">
            {profiles.filter(p => p.kyc_status === 'verified').length}
          </p>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30 p-4">
          <p className="text-amber-400 text-sm mb-1">Suspended</p>
          <p className="text-2xl font-bold text-white">
            {profiles.filter(p => p.platform_role === 'suspended').length}
          </p>
        </Card>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-slate-800/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredProfiles.filter(p => p.id).length && filteredProfiles.length > 0}
                    onCheckedChange={toggleAllSelection}
                  />
                </TableHead>
                <TableHead className="text-slate-300">{t('admin.userColumn')}</TableHead>
                <TableHead className="text-slate-300">{t('admin.emailColumn')}</TableHead>
                <TableHead className="text-slate-300">{t('admin.roleColumn')}</TableHead>
                <TableHead className="text-slate-300">{t('admin.reputationColumn')}</TableHead>
                <TableHead className="text-slate-300">{t('admin.tradesColumn')}</TableHead>
                <TableHead className="text-slate-300">{t('admin.kycStatusColumn')}</TableHead>
                <TableHead className="text-slate-300">{t('admin.joinedColumn')}</TableHead>
                <TableHead className="text-slate-300">{t('admin.actionsColumn')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => {
                const roleConfig = roleIcons[profile.platform_role] || roleIcons.user;
                const RoleIcon = roleConfig.icon;
                const isEditing = editingUser === profile.id;

                return (
                  <TableRow key={profile.id || profile.wallet_address} className="border-slate-700 hover:bg-slate-800/30">
                    <TableCell>
                      {profile.id && (
                        <Checkbox
                          checked={selectedUsers.includes(profile.id)}
                          onCheckedChange={() => toggleUserSelection(profile.id)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {(profile.display_name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{profile.display_name || t('profilePage.anonymousUser')}</p>
                          {profile._is_user_only && (
                            <p className="text-amber-400 text-xs">{t('admin.noProfileYet')}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-slate-300 text-sm font-mono">
                        {profile.wallet_address}
                      </p>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select value={newRole} onValueChange={setNewRole}>
                          <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
                            <SelectValue placeholder={t('admin.selectRole')} />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="super_admin">{t('admin.superAdmin')}</SelectItem>
                            <SelectItem value="admin">{t('admin.admin')}</SelectItem>
                            <SelectItem value="arbitrator">{t('admin.arbitrator')}</SelectItem>
                            <SelectItem value="user">{t('admin.user')}</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={`${roleConfig.bgColor} ${roleConfig.color} border ${roleConfig.borderColor}`}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {profile.platform_role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <ReputationBadge profile={profile} size="sm" showStats={false} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="text-white">{profile.total_trades || 0} {t('admin.totalLabel')}</p>
                        <p className="text-emerald-400 text-xs">{profile.successful_trades || 0} {t('admin.completedLabel')}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        profile.kyc_status === 'verified' 
                          ? 'border-emerald-500/30 text-emerald-400'
                          : profile.kyc_status === 'pending'
                          ? 'border-amber-500/30 text-amber-400'
                          : 'border-slate-600 text-slate-400'
                      }>
                        {profile.kyc_status || 'none'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-slate-400 text-xs">
                        {profile.created_date 
                          ? new Date(profile.created_date).toLocaleDateString()
                          : 'N/A'
                        }
                      </p>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateRole(profile)}
                            disabled={updateRole.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {updateRole.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('admin.save')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingUser(null);
                              setNewRole('');
                            }}
                            className="border-slate-600"
                          >
                            {t('admin.cancel')}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewingUser(profile)}
                            className="text-blue-400 hover:text-blue-300"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingUser(profile.id);
                              setNewRole(profile.platform_role);
                            }}
                            className="text-slate-400 hover:text-white"
                            title={t('admin.editRole')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          {profile.platform_role === 'suspended' ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => activateUser.mutate({ profileId: profile.id, originalRole: 'user' })}
                              className="text-emerald-400 hover:text-emerald-300"
                              disabled={activateUser.isPending}
                              title={t('admin.activateUser')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          ) : profile.platform_role !== 'super_admin' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => suspendUser.mutate({ profileId: profile.id })}
                              className="text-red-400 hover:text-red-300"
                              disabled={suspendUser.isPending}
                              title={t('admin.suspendUser')}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {filteredProfiles.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-slate-500">{t('admin.noUsersFound')}</p>
        </div>
      )}

      {/* User Detail Modal */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">User Details</DialogTitle>
            <DialogDescription className="text-slate-400">
              Complete profile information
            </DialogDescription>
          </DialogHeader>
          
          {viewingUser && (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                  {(viewingUser.display_name || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{viewingUser.display_name}</h3>
                  <WalletAddress address={viewingUser.wallet_address} />
                  <div className="flex gap-2 mt-2">
                    <ReputationBadge profile={viewingUser} />
                    <Badge className={
                      viewingUser.kyc_status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                      viewingUser.kyc_status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-500/20 text-slate-400'
                    }>
                      KYC: {viewingUser.kyc_status || 'none'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-slate-800/50 border-slate-700 p-4">
                  <p className="text-slate-400 text-xs mb-1">Reputation</p>
                  <p className="text-white text-xl font-bold">{viewingUser.reputation_score || 500}</p>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700 p-4">
                  <p className="text-slate-400 text-xs mb-1">Total Trades</p>
                  <p className="text-white text-xl font-bold">{viewingUser.total_trades || 0}</p>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700 p-4">
                  <p className="text-slate-400 text-xs mb-1">Volume</p>
                  <p className="text-white text-xl font-bold">${(viewingUser.total_volume || 0).toLocaleString()}</p>
                </Card>
              </div>

              {/* Trade Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-slate-400 text-sm">Success Rate</p>
                  <p className="text-emerald-400 font-semibold">
                    {viewingUser.total_trades > 0 
                      ? ((viewingUser.successful_trades / viewingUser.total_trades) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-slate-400 text-sm">Avg Response Time</p>
                  <p className="text-blue-400 font-semibold">{viewingUser.response_time_hours?.toFixed(1) || 0}h</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-slate-400 text-sm">Disputed Trades</p>
                  <p className="text-red-400 font-semibold">{viewingUser.disputed_trades || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-slate-400 text-sm">Member Since</p>
                  <p className="text-slate-300 font-semibold">
                    {viewingUser.created_date ? format(new Date(viewingUser.created_date), 'MMM d, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="space-y-3 pt-4 border-t border-slate-700">
                <h4 className="text-sm font-semibold text-white">Admin Actions</h4>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <span className="text-slate-300 text-sm">KYC Verification</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => verifyKYC.mutate({ profileId: viewingUser.id, status: 'verified' })}
                      disabled={viewingUser.kyc_status === 'verified'}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => verifyKYC.mutate({ profileId: viewingUser.id, status: 'rejected' })}
                      className="border-red-500/50 text-red-400"
                    >
                      Reject
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <span className="text-slate-300 text-sm">Adjust Reputation</span>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      defaultValue={viewingUser.reputation_score || 500}
                      className="w-24 bg-slate-900 border-slate-700"
                      id={`rep-${viewingUser.id}`}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById(`rep-${viewingUser.id}`);
                        adjustReputation.mutate({ 
                          profileId: viewingUser.id, 
                          newScore: parseInt(input.value) 
                        });
                      }}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}