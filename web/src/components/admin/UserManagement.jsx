import React, { useState } from 'react';
import { adminApi } from "@/api/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from '@/hooks/useTranslation';
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
  Filter,
  Users,
  ChevronLeft,
  ChevronRight
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
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewingUser, setViewingUser] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', page, searchQuery],
    queryFn: () => adminApi.listUsers(page, limit, searchQuery),
    keepPreviousData: true
  });

  const profiles = usersData?.data || [];
  const meta = usersData?.meta || { total: 0, totalPages: 0 };

  const updateRole = useMutation({
    mutationFn: ({ profileId, platform_role }) => 
      adminApi.addRole(platform_role + 's', profileId), // Quick hack: role + 's' matches 'admins', 'arbitrators'
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated successfully');
      setEditingUser(null);
      setNewRole('');
    },
    onError: (error) => {
      toast.error('Failed to update role: ' + (error.response?.data?.message || error.message));
    }
  });

  const handleExport = () => {
    // For export, we might want to fetch all or use current view
    // Currently implementing basic CSV export of current view
    const csv = [
      ['Name', 'Address', 'Role', 'Reputation', 'Trades', 'Joined'].join(','),
      ...profiles.map(p => [
        p.displayName || 'Anonymous',
        p.address,
        p.roles?.[0]?.role || 'USER',
        p.reputationScore || 0,
        p.successfulTrades || 0,
        p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'
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
    if (selectedUsers.length === profiles.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(profiles.map(p => p.address));
    }
  };

  const handleUpdateRole = (profile) => {
    if (!newRole) {
      toast.error('Please select a role');
      return;
    }
    // Mapping generic roles to API expected roles if needed
    // Assuming backend handles 'admin', 'arbitrator'
    updateRole.mutate({ profileId: profile.address, platform_role: newRole });
  };

  const roleIcons = {
    SUPER_ADMIN: { icon: Crown, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
    ADMIN: { icon: Shield, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
    ARBITRATOR: { icon: Scale, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
    USER: { icon: User, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' }
  };

  return (
    <Card className="bg-slate-900/90 border-slate-700/50 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{t('admin.userManagement')}</h2>
        <p className="text-slate-400">{t('admin.manageRolesPermissions')}</p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex gap-3">
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
                    checked={selectedUsers.length === profiles.length && profiles.length > 0}
                    onCheckedChange={toggleAllSelection}
                  />
                </TableHead>
                <TableHead className="text-slate-300">{t('admin.userColumn')}</TableHead>
                <TableHead className="text-slate-300">{t('admin.emailColumn')}</TableHead>
                <TableHead className="text-slate-300">{t('admin.roleColumn')}</TableHead>
                <TableHead className="text-slate-300">{t('admin.reputationColumn')}</TableHead>
                <TableHead className="text-slate-300">{t('admin.tradesColumn')}</TableHead>
                <TableHead className="text-slate-300">{t('admin.joinedColumn')}</TableHead>
                <TableHead className="text-slate-300">{t('admin.actionsColumn')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => {
                const userRole = profile.roles?.[0]?.role || 'USER';
                const roleConfig = roleIcons[userRole] || roleIcons.USER;
                const RoleIcon = roleConfig.icon;
                const isEditing = editingUser === profile.address;

                return (
                  <TableRow key={profile.address} className="border-slate-700 hover:bg-slate-800/30">
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(profile.address)}
                        onCheckedChange={() => toggleUserSelection(profile.address)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {(profile.displayName || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{profile.displayName || t('profilePage.anonymousUser')}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-slate-300 text-sm font-mono">
                        <WalletAddress address={profile.address} />
                      </p>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select value={newRole} onValueChange={setNewRole}>
                          <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
                            <SelectValue placeholder={t('admin.selectRole')} />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="admin">{t('admin.admin')}</SelectItem>
                            <SelectItem value="arbitrator">{t('admin.arbitrator')}</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={`${roleConfig.bgColor} ${roleConfig.color} border ${roleConfig.borderColor}`}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {userRole}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-white">{profile.reputationScore || 0}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="text-white">{profile.successfulTrades || 0} {t('admin.completedLabel')}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-slate-400 text-xs">
                        {profile.createdAt 
                          ? new Date(profile.createdAt).toLocaleDateString()
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
                              setEditingUser(profile.address);
                              setNewRole(userRole === 'USER' ? '' : userRole.toLowerCase());
                            }}
                            className="text-slate-400 hover:text-white"
                            title={t('admin.editRole')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-slate-400">
          Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, meta.total)} of {meta.total} users
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

      {profiles.length === 0 && !isLoading && (
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
                  {(viewingUser.displayName || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{viewingUser.displayName}</h3>
                  <WalletAddress address={viewingUser.address} />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-slate-800/50 border-slate-700 p-4">
                  <p className="text-slate-400 text-xs mb-1">Reputation</p>
                  <p className="text-white text-xl font-bold">{viewingUser.reputationScore || 0}</p>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700 p-4">
                  <p className="text-slate-400 text-xs mb-1">Completed Trades</p>
                  <p className="text-white text-xl font-bold">{viewingUser.successfulTrades || 0}</p>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700 p-4">
                  <p className="text-slate-400 text-xs mb-1">Volume</p>
                  <p className="text-white text-xl font-bold">${Number(viewingUser.totalVolume || 0).toLocaleString()}</p>
                </Card>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-700">
                 <p className="text-sm text-slate-400">
                   Member since: {viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleDateString() : 'N/A'}
                 </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}