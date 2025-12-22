Amend your Pages Polish based on the following:

Admin:

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWallet } from '@/components/wallet/WalletContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Wallet, Users, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const { isAdmin } = useWallet();

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You do not have admin permissions. This page is restricted.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Console</h1>
        <p className="text-gray-600">Platform administration and management</p>
      </div>

      <Tabs defaultValue="pools">
        <TabsList>
          <TabsTrigger value="pools">Platform Pools</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="mt-6">
          <PoolsPanel />
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <RolesPanel />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <StatsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PoolsPanel() {
  const { data: escrows = [] } = useQuery({
    queryKey: ['all-escrows-for-pools'],
    queryFn: () => base44.entities.Escrow.list('-created_date', 500),
    initialData: [],
  });

  // Calculate pools by token
  const pools = {};
  escrows.forEach(escrow => {
    const token = escrow.tokenSymbol || 'BNB';
    if (!pools[token]) {
      pools[token] = { fees: 0, bonds: 0, total: 0 };
    }
    if (escrow.state === 'RESOLVED') {
      pools[token].fees += escrow.feeAmount || 0;
      // Bond revenue only from disputes
      if (escrow.disputeOutcome) {
        pools[token].bonds += (escrow.disputeOutcome === 'BUYER_WINS' ? escrow.sellerBond : escrow.buyerBond) || 0;
      }
    }
  });

  Object.keys(pools).forEach(token => {
    pools[token].total = pools[token].fees + pools[token].bonds;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Platform Revenue Pools
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(pools).length === 0 ? (
            <p className="text-center text-gray-500 py-8">No revenue collected yet</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(pools).map(([token, amounts]) => (
                <div key={token} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{token}</h3>
                    <Badge variant="outline" className="text-lg">
                      Total: {amounts.total.toFixed(6)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Fee Revenue:</span>
                      <p className="font-medium">{amounts.fees.toFixed(6)} {token}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Bond Revenue:</span>
                      <p className="font-medium">{amounts.bonds.toFixed(6)} {token}</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Wallet className="w-4 h-4 mr-2" />
                    Withdraw {token}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          In production, withdrawals would trigger on-chain transactions to the fee recipient address.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function RolesPanel() {
  const queryClient = useQueryClient();
  const [newAddress, setNewAddress] = useState('');
  const [newRole, setNewRole] = useState('ARBITRATOR');

  const { data: userRoles = [], isLoading } = useQuery({
    queryKey: ['all-user-roles'],
    queryFn: () => base44.entities.UserRole.list('-created_date', 100),
    initialData: [],
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ address, role }) => {
      // Check if user already has a role
      const existing = userRoles.find(r => r.walletAddress === address);
      if (existing) {
        return base44.entities.UserRole.update(existing.id, { role });
      } else {
        return base44.entities.UserRole.create({ walletAddress: address, role });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-user-roles']);
      setNewAddress('');
      toast.success('Role updated successfully');
    },
    onError: () => {
      toast.error('Failed to update role');
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: (id) => base44.entities.UserRole.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-user-roles']);
      toast.success('Role removed');
    },
  });

  const handleAddRole = () => {
    if (!newAddress.trim()) {
      toast.error('Please enter a wallet address');
      return;
    }
    addRoleMutation.mutate({ address: newAddress, role: newRole });
  };

  const privilegedUsers = userRoles.filter(r => r.role !== 'USER');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Privileged Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Wallet Address</Label>
            <Input
              id="address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ARBITRATOR">Arbitrator</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAddRole} disabled={addRoleMutation.isPending} className="w-full">
            {addRoleMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Role
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Privileged Users ({privilegedUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {privilegedUsers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No privileged users yet</p>
          ) : (
            <div className="space-y-3">
              {privilegedUsers.map((userRole) => (
                <div
                  key={userRole.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-mono text-sm">{userRole.walletAddress}</p>
                    <Badge variant="secondary" className="mt-1">
                      {userRole.role}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeRoleMutation.mutate(userRole.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatsPanel() {
  const { data: escrows = [] } = useQuery({
    queryKey: ['all-escrows-stats'],
    queryFn: () => base44.entities.Escrow.list('-created_date', 1000),
    initialData: [],
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ['all-disputes-stats'],
    queryFn: () => base44.entities.Dispute.list('-created_date', 1000),
    initialData: [],
  });

  const stats = {
    totalEscrows: escrows.length,
    activeEscrows: escrows.filter(e => !['RESOLVED', 'CANCELLED'].includes(e.state)).length,
    completedEscrows: escrows.filter(e => e.state === 'RESOLVED').length,
    totalDisputes: disputes.length,
    openDisputes: disputes.filter(d => d.status === 'OPEN' || d.status === 'UNDER_REVIEW').length,
    resolvedDisputes: disputes.filter(d => d.status === 'RESOLVED').length,
  };

  const statCards = [
    { label: 'Total Escrows', value: stats.totalEscrows, color: 'text-blue-600' },
    { label: 'Active Escrows', value: stats.activeEscrows, color: 'text-orange-600' },
    { label: 'Completed', value: stats.completedEscrows, color: 'text-green-600' },
    { label: 'Total Disputes', value: stats.totalDisputes, color: 'text-purple-600' },
    { label: 'Open Disputes', value: stats.openDisputes, color: 'text-red-600' },
    { label: 'Resolved Disputes', value: stats.resolvedDisputes, color: 'text-green-600' },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat, idx) => (
        <Card key={idx}>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


Arbitration:

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWallet } from '@/components/wallet/WalletContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Gavel, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function Arbitration() {
  const { isArbitrator, connectedWallet } = useWallet();
  const [activeTab, setActiveTab] = useState('open');

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ['all-disputes'],
    queryFn: async () => {
      return base44.entities.Dispute.list('-created_date', 100);
    },
    initialData: [],
  });

  if (!isArbitrator) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You do not have arbitrator permissions. This page is restricted.
        </AlertDescription>
      </Alert>
    );
  }

  const openDisputes = disputes.filter(d => d.status === 'OPEN' || d.status === 'UNDER_REVIEW');
  const resolvedDisputes = disputes.filter(d => d.status === 'RESOLVED');

  const stats = [
    {
      label: 'Total Disputes',
      value: disputes.length,
      icon: Gavel,
      color: 'text-purple-600',
    },
    {
      label: 'Open',
      value: openDisputes.length,
      icon: AlertTriangle,
      color: 'text-orange-600',
    },
    {
      label: 'Resolved',
      value: resolvedDisputes.length,
      icon: CheckCircle,
      color: 'text-green-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Arbitration Console</h1>
        <p className="text-gray-600">Manage and resolve escrow disputes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="open">Open Disputes ({openDisputes.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedDisputes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-6">
          <DisputeList disputes={openDisputes} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="resolved" className="mt-6">
          <DisputeList disputes={resolvedDisputes} isLoading={isLoading} resolved />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DisputeList({ disputes, isLoading, resolved = false }) {
  const { data: escrowsMap = {} } = useQuery({
    queryKey: ['escrows-for-disputes'],
    queryFn: async () => {
      const allEscrows = await base44.entities.Escrow.list('-created_date', 200);
      return allEscrows.reduce((acc, escrow) => {
        acc[escrow.escrowId] = escrow;
        return acc;
      }, {});
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-dashed">
        <p className="text-gray-500">
          {resolved ? 'No resolved disputes' : 'No open disputes'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {disputes.map((dispute) => {
        const escrow = escrowsMap[dispute.escrowId];
        if (!escrow) return null;

        return (
          <Card key={dispute.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">
                      {escrow.title || `Escrow ${escrow.escrowId?.slice(0, 8)}`}
                    </h3>
                    {resolved && dispute.outcome && (
                      <Badge
                        variant={dispute.outcome === 'BUYER_WINS' ? 'default' : 'secondary'}
                      >
                        {dispute.outcome === 'BUYER_WINS' ? 'Buyer Won' : 'Seller Won'}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium ml-2">
                        {escrow.amount} {escrow.tokenSymbol}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Opened:</span>
                      <span className="ml-2">{format(new Date(dispute.created_date), 'PP')}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Reason:</p>
                    <p className="text-sm">{dispute.reason}</p>
                  </div>

                  {resolved && dispute.arbitratorNote && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">Resolution Note:</p>
                      <p className="text-sm">{dispute.arbitratorNote}</p>
                    </div>
                  )}
                </div>

                <Link to={createPageUrl('EscrowDetail') + `?id=${escrow.id}`}>
                  <Button>
                    <Eye className="w-4 h-4 mr-2" />
                    {resolved ? 'View' : 'Resolve'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

Create Escrow/Trade:

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useWallet } from '@/components/wallet/WalletContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import OrderTemplates from '@/components/marketplace/OrderTemplates';
import TokenPresets from '@/components/marketplace/TokenPresets';

export default function CreateEscrow() {
  const navigate = useNavigate();
  const { connectedWallet, isConnected } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('template');

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    tokenKey: '0x0000000000000000000000000000000000000000',
    tokenSymbol: 'BNB',
    buyer: '',
    sellerBond: '',
    buyerBond: '',
    paymentWindow: '24',
    releaseWindow: '24',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (template) => {
    const amount = parseFloat(formData.amount) || 0;
    setFormData({
      ...formData,
      paymentWindow: template.defaults.paymentWindow.toString(),
      releaseWindow: template.defaults.releaseWindow.toString(),
      sellerBond: (amount * template.defaults.sellerBond).toString(),
      buyerBond: (amount * template.defaults.buyerBond).toString(),
    });
    setActiveTab('manual');
    toast.success(`${template.name} template applied`);
  };

  const handleTokenSelect = (token) => {
    setFormData({
      ...formData,
      tokenKey: token.address,
      tokenSymbol: token.symbol,
    });
  };

  const handleAmountSelect = (amount) => {
    setFormData({
      ...formData,
      amount: amount.toString(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate escrowId
      const escrowId = '0x' + Date.now().toString(16) + Math.random().toString(16).slice(2, 18);
      
      // Calculate fee (2% of amount)
      const feeAmount = parseFloat(formData.amount) * 0.02;

      const escrowData = {
        escrowId,
        seller: connectedWallet,
        buyer: formData.buyer || null,
        tokenKey: formData.tokenKey,
        tokenSymbol: formData.tokenSymbol,
        amount: parseFloat(formData.amount),
        feeAmount,
        sellerBond: parseFloat(formData.sellerBond) || 0,
        buyerBond: parseFloat(formData.buyerBond) || 0,
        paymentWindow: parseInt(formData.paymentWindow),
        releaseWindow: parseInt(formData.releaseWindow),
        state: 'CREATED',
        title: formData.title,
      };

      const created = await base44.entities.Escrow.create(escrowData);
      
      toast.success('Escrow created successfully!');
      navigate(createPageUrl('EscrowDetail') + `?id=${created.id}`);
    } catch (error) {
      console.error('Error creating escrow:', error);
      toast.error('Failed to create escrow');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to create an escrow.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Plus className="w-8 h-8" />
          Create New Escrow
        </h1>
        <p className="text-gray-600">Set up a new P2P escrow with templates or custom settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="template">
            <Sparkles className="w-4 h-4 mr-2" />
            Quick Templates
          </TabsTrigger>
          <TabsTrigger value="manual">
            Custom Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose a Template</CardTitle>
              <p className="text-sm text-gray-600">Select a pre-configured template to get started quickly</p>
            </CardHeader>
            <CardContent>
              <OrderTemplates onSelect={handleTemplateSelect} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Escrow Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="e.g., Sell 1 BNB for USD"
                    required
                  />
                </div>

                {/* Token Presets */}
                <TokenPresets
                  selectedToken={formData.tokenSymbol}
                  onTokenSelect={handleTokenSelect}
                  onAmountSelect={handleAmountSelect}
                />

                {/* Custom Amount */}
                <div>
                  <Label htmlFor="amount">Custom Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.000001"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

            {/* Buyer Address */}
            <div>
              <Label htmlFor="buyer">Buyer Address (Optional)</Label>
              <Input
                id="buyer"
                value={formData.buyer}
                onChange={(e) => handleChange('buyer', e.target.value)}
                placeholder="Leave empty for open escrow"
              />
              <p className="text-xs text-gray-500 mt-1">
                If specified, only this address can take the escrow
              </p>
            </div>

            {/* Bonds */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sellerBond">Seller Bond</Label>
                <Input
                  id="sellerBond"
                  type="number"
                  step="0.000001"
                  value={formData.sellerBond}
                  onChange={(e) => handleChange('sellerBond', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="buyerBond">Buyer Bond</Label>
                <Input
                  id="buyerBond"
                  type="number"
                  step="0.000001"
                  value={formData.buyerBond}
                  onChange={(e) => handleChange('buyerBond', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Time Windows */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentWindow">Payment Window (hours)</Label>
                <Input
                  id="paymentWindow"
                  type="number"
                  value={formData.paymentWindow}
                  onChange={(e) => handleChange('paymentWindow', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="releaseWindow">Release Window (hours)</Label>
                <Input
                  id="releaseWindow"
                  type="number"
                  value={formData.releaseWindow}
                  onChange={(e) => handleChange('releaseWindow', e.target.value)}
                />
              </div>
            </div>

            {/* Fee Info */}
            {formData.amount && (
              <Alert>
                <AlertDescription>
                  Platform fee: {(parseFloat(formData.amount) * 0.02).toFixed(6)} {formData.tokenSymbol} (2%)
                </AlertDescription>
              </Alert>
            )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Escrow
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

Dashboard:

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWallet } from '@/components/wallet/WalletContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import EscrowCard from '@/components/escrow/EscrowCard';
import { Skeleton } from '@/components/ui/skeleton';
import UserStatsPanel from '@/components/marketplace/UserStatsPanel';
import RecentActivity from '@/components/marketplace/RecentActivity';
import FeeCalculator from '@/components/marketplace/FeeCalculator';

export default function Dashboard() {
  const { connectedWallet, isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState('all');

  const { data: escrows, isLoading } = useQuery({
    queryKey: ['my-escrows', connectedWallet],
    queryFn: async () => {
      if (!connectedWallet) return [];
      const allEscrows = await base44.entities.Escrow.list('-created_date', 100);
      return allEscrows.filter(
        e => e.seller === connectedWallet || e.buyer === connectedWallet
      );
    },
    enabled: isConnected,
    initialData: [],
  });

  if (!isConnected) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to view your dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  const asSeller = escrows.filter(e => e.seller === connectedWallet);
  const asBuyer = escrows.filter(e => e.buyer === connectedWallet);
  const activeEscrows = escrows.filter(e => 
    !['RESOLVED', 'CANCELLED'].includes(e.state)
  );
  const completedEscrows = escrows.filter(e => 
    ['RESOLVED', 'CANCELLED'].includes(e.state)
  );

  const stats = [
    {
      label: 'Total Escrows',
      value: escrows.length,
      icon: Wallet,
      color: 'text-blue-600',
    },
    {
      label: 'As Seller',
      value: asSeller.length,
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      label: 'As Buyer',
      value: asBuyer.length,
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      label: 'Active',
      value: activeEscrows.length,
      icon: AlertCircle,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-gray-600">Manage your escrow transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Side Panels */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <UserStatsPanel />
            <FeeCalculator />
          </div>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="seller">As Seller</TabsTrigger>
              <TabsTrigger value="buyer">As Buyer</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <EscrowList escrows={escrows} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="seller" className="mt-6">
              <EscrowList escrows={asSeller} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="buyer" className="mt-6">
              <EscrowList escrows={asBuyer} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="active" className="mt-6">
              <EscrowList escrows={activeEscrows} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <RecentActivity limit={8} />
        </div>
      </div>
    </div>
  );
}

function EscrowList({ escrows, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    );
  }

  if (escrows.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-dashed">
        <p className="text-gray-500">No escrows found</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {escrows.map((escrow) => (
        <EscrowCard key={escrow.id} escrow={escrow} />
      ))}
    </div>
  );
}



Escrow/Trade Detail:

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWallet } from '@/components/wallet/WalletContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Coins, 
  User, 
  Clock, 
  Shield,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import StateBadge from '@/components/escrow/StateBadge';
import EscrowTimeline from '@/components/escrow/EscrowTimeline';
import ChatBox from '@/components/escrow/ChatBox';
import NextActionButton, { getNextAction } from '@/components/escrow/NextActionEngine';
import PaymentInstructionsPanel from '@/components/escrow/PaymentInstructionsPanel';
import EvidencePanel from '@/components/escrow/EvidencePanel';
import DisputePanel from '@/components/escrow/DisputePanel';

export default function EscrowDetail() {
  const queryClient = useQueryClient();
  const { connectedWallet, userRole, isConnected } = useWallet();
  const urlParams = new URLSearchParams(window.location.search);
  const escrowDbId = urlParams.get('id');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: escrow, isLoading } = useQuery({
    queryKey: ['escrow', escrowDbId],
    queryFn: async () => {
      const escrows = await base44.entities.Escrow.filter({ id: escrowDbId });
      return escrows[0];
    },
    enabled: !!escrowDbId,
  });

  const updateEscrowMutation = useMutation({
    mutationFn: async ({ state, updates = {} }) => {
      return base44.entities.Escrow.update(escrowDbId, {
        state,
        ...updates,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['escrow', escrowDbId]);
    },
  });

  const handleAction = async (action) => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsProcessing(true);
    try {
      switch (action) {
        case 'TAKE':
          await updateEscrowMutation.mutateAsync({
            state: 'TAKEN',
            updates: { buyer: connectedWallet },
          });
          toast.success('Escrow taken successfully!');
          break;

        case 'FUND':
          await updateEscrowMutation.mutateAsync({
            state: 'FUNDED',
            updates: { fundedAt: new Date().toISOString() },
          });
          toast.success('Escrow funded successfully!');
          break;

        case 'CONFIRM_PAYMENT':
          await updateEscrowMutation.mutateAsync({
            state: 'PAYMENT_CONFIRMED',
          });
          toast.success('Payment confirmed!');
          break;

        case 'RELEASE':
          await updateEscrowMutation.mutateAsync({
            state: 'RESOLVED',
          });
          toast.success('Escrow released successfully!');
          break;

        case 'OPEN_DISPUTE':
          // Will be handled by DisputePanel
          break;

        case 'RESOLVE_DISPUTE':
          // Will be handled by DisputePanel
          break;

        default:
          toast.error('Unknown action');
      }
    } catch (error) {
      console.error('Action error:', error);
      toast.error('Action failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!escrow) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Escrow not found</AlertDescription>
      </Alert>
    );
  }

  const formatAddress = (address) => {
    if (!address) return 'Not set';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isSeller = escrow.seller === connectedWallet;
  const isBuyer = escrow.buyer === connectedWallet;
  const isParticipant = isSeller || isBuyer;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to={createPageUrl('Dashboard')}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
            {escrow.title || `Escrow ${escrow.escrowId?.slice(0, 8)}`}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <StateBadge state={escrow.state} />
            {isSeller && (
              <Badge variant="outline" className="bg-blue-100 border-blue-300 text-blue-700">
                <User className="w-3 h-3 mr-1" />
                You are the Seller
              </Badge>
            )}
            {isBuyer && (
              <Badge variant="outline" className="bg-green-100 border-green-300 text-green-700">
                <User className="w-3 h-3 mr-1" />
                You are the Buyer
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Escrow Info */}
          <Card>
            <CardHeader>
              <CardTitle>Escrow Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Coins className="w-4 h-4" />
                    Amount
                  </div>
                  <p className="text-2xl font-bold">
                    {escrow.amount} {escrow.tokenSymbol}
                  </p>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Platform Fee</div>
                  <p className="text-lg font-semibold">
                    {escrow.feeAmount} {escrow.tokenSymbol}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <User className="w-4 h-4" />
                    Seller
                  </div>
                  <p className="font-medium">{formatAddress(escrow.seller)}</p>
                  {escrow.sellerBond > 0 && (
                    <p className="text-xs text-gray-500">
                      Bond: {escrow.sellerBond} {escrow.tokenSymbol}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <User className="w-4 h-4" />
                    Buyer
                  </div>
                  <p className="font-medium">{formatAddress(escrow.buyer)}</p>
                  {escrow.buyerBond > 0 && (
                    <p className="text-xs text-gray-500">
                      Bond: {escrow.buyerBond} {escrow.tokenSymbol}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    Payment Window
                  </div>
                  <p className="font-medium">{escrow.paymentWindow} hours</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    Release Window
                  </div>
                  <p className="font-medium">{escrow.releaseWindow} hours</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">Escrow ID</p>
                <p className="text-sm font-mono break-all">{escrow.escrowId}</p>
              </div>
            </CardContent>
          </Card>

          {/* Next Action */}
          {isConnected && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Next Action
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NextActionButton
                  escrow={escrow}
                  connectedWallet={connectedWallet}
                  userRole={userRole}
                  onAction={handleAction}
                />
                {!getNextAction(escrow, connectedWallet, userRole) && (
                  <p className="text-center text-gray-500 text-sm">
                    {isParticipant
                      ? 'No actions available at this time'
                      : 'You are not a participant in this escrow'}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tabs for Interaction */}
          <Tabs defaultValue="chat">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-4">
              <ChatBox
                escrowId={escrow.escrowId}
                connectedWallet={connectedWallet}
                escrow={escrow}
              />
            </TabsContent>

            <TabsContent value="payment" className="mt-4">
              <PaymentInstructionsPanel
                escrowId={escrow.escrowId}
                escrow={escrow}
                connectedWallet={connectedWallet}
              />
            </TabsContent>

            <TabsContent value="evidence" className="mt-4">
              <EvidencePanel
                escrowId={escrow.escrowId}
                connectedWallet={connectedWallet}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Timeline & Dispute */}
        <div className="space-y-6">
          <EscrowTimeline escrow={escrow} />

          {escrow.state === 'DISPUTED' && (
            <DisputePanel
              escrowId={escrow.escrowId}
              escrowDbId={escrowDbId}
              escrow={escrow}
              connectedWallet={connectedWallet}
              userRole={userRole}
            />
          )}
        </div>
      </div>
    </div>
  );
}

Explore:

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import EscrowCard from '@/components/escrow/EscrowCard';
import QuickFilters from '@/components/marketplace/QuickFilters';
import { Skeleton } from '@/components/ui/skeleton';

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [tokenFilter, setTokenFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');

  // Read filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const state = params.get('state');
    if (state) setStateFilter(state);
  }, []);

  const { data: escrows, isLoading } = useQuery({
    queryKey: ['escrows'],
    queryFn: () => base44.entities.Escrow.list('-created_date', 100),
    initialData: [],
  });

  const availableTokens = [...new Set(escrows.map(e => e.tokenSymbol).filter(Boolean))];

  const filteredAndSortedEscrows = escrows
    .filter(escrow => {
      const matchesSearch = searchTerm === '' || 
        escrow.escrowId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        escrow.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        escrow.seller?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        escrow.buyer?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesState = stateFilter === 'all' || escrow.state === stateFilter;
      const matchesToken = tokenFilter === 'all' || escrow.tokenSymbol === tokenFilter;
      
      return matchesSearch && matchesState && matchesToken;
    })
    .sort((a, b) => {
      let compareValue = 0;
      
      if (sortBy === 'created') {
        compareValue = new Date(a.created_date) - new Date(b.created_date);
      } else if (sortBy === 'amount') {
        compareValue = (a.amount || 0) - (b.amount || 0);
      } else if (sortBy === 'state') {
        compareValue = (a.state || '').localeCompare(b.state || '');
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Explore Escrows</h1>
          <p className="text-gray-600">Browse all active and completed escrow transactions</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by ID, title, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <QuickFilters
            stateFilter={stateFilter}
            setStateFilter={setStateFilter}
            tokenFilter={tokenFilter}
            setTokenFilter={setTokenFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            availableTokens={availableTokens}
          />
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedEscrows.length} escrow{filteredAndSortedEscrows.length !== 1 ? 's' : ''}
          </div>
          {filteredAndSortedEscrows.length > 0 && (
            <div className="text-xs text-gray-500">
              Sorted by {sortBy} ({sortOrder})
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : filteredAndSortedEscrows.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-2">No escrows found</p>
            <p className="text-sm text-gray-500 mb-6">Try adjusting your filters or search terms</p>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStateFilter('all');
              setTokenFilter('all');
            }}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedEscrows.map((escrow) => (
              <EscrowCard key={escrow.id} escrow={escrow} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Home:

import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Zap, Users, ArrowRight, CheckCircle, Plus } from 'lucide-react';
import { useWallet } from '@/components/wallet/WalletContext';

export default function Home() {
  const { isConnected } = useWallet();

  const features = [
    {
      icon: Shield,
      title: 'Secure Escrow',
      description: 'Smart contract-based escrow ensures your funds are safe until both parties fulfill their obligations.',
      color: 'blue'
    },
    {
      icon: Lock,
      title: 'Non-Custodial',
      description: 'You maintain full control of your wallet. No platform custody of your assets.',
      color: 'green'
    },
    {
      icon: Zap,
      title: 'Fast Settlement',
      description: 'Instant on-chain settlement when both parties agree. No waiting for traditional intermediaries.',
      color: 'purple'
    },
    {
      icon: Users,
      title: 'Dispute Resolution',
      description: 'Fair arbitration system with professional arbitrators to resolve any disputes.',
      color: 'amber'
    },
  ];

  const steps = [
    { step: 1, title: 'Create Escrow', desc: 'Seller creates an escrow with terms' },
    { step: 2, title: 'Buyer Takes', desc: 'Buyer accepts the escrow terms' },
    { step: 3, title: 'Seller Funds', desc: 'Seller locks crypto in escrow' },
    { step: 4, title: 'Buyer Pays', desc: 'Buyer sends fiat and confirms' },
    { step: 5, title: 'Seller Releases', desc: 'Seller releases crypto to buyer' },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
          <Shield className="w-4 h-4" />
          Secure P2P Trading on BSC
        </div>
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Trustfy Escrow Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Trade cryptocurrencies peer-to-peer with confidence. Smart contract escrow protects both buyers and sellers.
        </p>
        <div className="flex gap-4 justify-center">
          {isConnected ? (
            <>
              <Link to={createPageUrl('CreateEscrow')}>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Create Escrow
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('Explore')}>
                <Button size="lg" variant="outline">
                  Browse Escrows
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to={createPageUrl('Explore')}>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Explore Marketplace
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <div className="text-sm text-gray-500 self-center">
                Connect wallet to start trading
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Trustfy?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const colorClasses = {
              blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
              green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
              purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
              amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' },
            }[feature.color];

            return (
              <Card key={idx} className={`text-center hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 ${colorClasses.border}`}>
                <CardContent className="pt-6 pb-6">
                  <div className={`w-14 h-14 ${colorClasses.bg} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                    <Icon className={`w-7 h-7 ${colorClasses.text}`} />
                  </div>
                  <h3 className="font-bold text-lg mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 md:p-12 shadow-lg border border-blue-100">
        <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Simple, secure, and transparent P2P trading in 5 easy steps
        </p>
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 hidden lg:block rounded-full" />

            <div className="grid md:grid-cols-5 gap-6 md:gap-4 relative">
              {steps.map((item, idx) => (
                <div key={idx} className="text-center group">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4 relative z-10 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>
                  <h4 className="font-bold mb-2 text-gray-900">{item.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed px-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJWMzZoLTJ6bTAtNGgydi0yaC0ydjJ6bS0yIDBoMnYtMmgtMnYyem0wLTJoMnYtMmgtMnYyem0wLTJoMnYtMmgtMnYyem0yLTJoLTJ2Mmgydi0yem0wLTJoLTJ2Mmgydi0yem0wLTJoLTJ2Mmgydi0yem0wLTJoLTJ2Mmgydi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of users trading safely with Trustfy escrow protection on BSC.
          </p>
          {!isConnected ? (
            <div className="space-y-4">
              <div className="text-blue-100 text-lg font-medium">
                Connect your wallet to get started
              </div>
              <div className="flex gap-3 justify-center flex-wrap text-sm text-blue-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  No registration required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  2% platform fee
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Professional arbitration
                </div>
              </div>
            </div>
          ) : (
            <Link to={createPageUrl('CreateEscrow')}>
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Escrow
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

Market Place:

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, TrendingUp, DollarSign, Shield, AlertCircle } from 'lucide-react';
import EscrowCard from '@/components/escrow/EscrowCard';
import QuickFilters from '@/components/marketplace/QuickFilters';
import { Skeleton } from '@/components/ui/skeleton';

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('CREATED');
  const [tokenFilter, setTokenFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeTab, setActiveTab] = useState('buy');

  const { data: escrows = [], isLoading } = useQuery({
    queryKey: ['marketplace-escrows'],
    queryFn: () => base44.entities.Escrow.list('-created_date', 200),
    initialData: [],
  });

  const availableTokens = [...new Set(escrows.map(e => e.tokenSymbol).filter(Boolean))];

  // Buy listings - created escrows by others (looking for buyers)
  const buyListings = escrows.filter(e => e.state === 'CREATED');

  // Sell listings - taken escrows not yet funded (looking for sellers to fund)
  const sellListings = escrows.filter(e => e.state === 'TAKEN');

  const activeListings = activeTab === 'buy' ? buyListings : sellListings;

  const filteredAndSorted = activeListings
    .filter(escrow => {
      const matchesSearch = searchTerm === '' || 
        escrow.escrowId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        escrow.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesToken = tokenFilter === 'all' || escrow.tokenSymbol === tokenFilter;
      
      return matchesSearch && matchesToken;
    })
    .sort((a, b) => {
      let compareValue = 0;
      
      if (sortBy === 'created') {
        compareValue = new Date(a.created_date) - new Date(b.created_date);
      } else if (sortBy === 'amount') {
        compareValue = (a.amount || 0) - (b.amount || 0);
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

  // Market stats
  const stats = [
    {
      label: 'Available to Buy',
      value: buyListings.length,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Awaiting Funding',
      value: sellListings.length,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Active Trades',
      value: escrows.filter(e => ['FUNDED', 'PAYMENT_CONFIRMED'].includes(e.state)).length,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">P2P Marketplace</h1>
        <p className="text-gray-600">Buy and sell crypto with escrow protection</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by ID or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-4">
          <QuickFilters
            stateFilter={stateFilter}
            setStateFilter={setStateFilter}
            tokenFilter={tokenFilter}
            setTokenFilter={setTokenFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            availableTokens={availableTokens}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy">
            Buy Crypto ({buyListings.length})
          </TabsTrigger>
          <TabsTrigger value="sell">
            Sell Crypto ({sellListings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="mt-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              These sellers are offering crypto. Take an escrow to start a trade.
            </p>
          </div>
          <ListingsGrid escrows={filteredAndSorted} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="sell" className="mt-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              These buyers are waiting for sellers to fund. Fund an escrow to complete the trade.
            </p>
          </div>
          <ListingsGrid escrows={filteredAndSorted} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ListingsGrid({ escrows, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    );
  }

  if (escrows.length === 0) {
    return (
      <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-lg font-semibold text-gray-700 mb-2">No listings available</p>
        <p className="text-sm text-gray-500 mb-6">Be the first to create an escrow</p>
        <Link to={createPageUrl('CreateEscrow')}>
          <Button>Create Escrow</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {escrows.map((escrow) => (
        <EscrowCard key={escrow.id} escrow={escrow} />
      ))}
    </div>
  );
}

Profile:


import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWallet } from '@/components/wallet/WalletContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  User,
  Award,
  TrendingUp,
  Shield,
  AlertCircle,
  CheckCircle,
  Edit2,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import StateBadge from '@/components/escrow/StateBadge';
import { format } from 'date-fns';

export default function Profile() {
  const { connectedWallet, isConnected, userRole } = useWallet();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const { data: userRoleData } = useQuery({
    queryKey: ['user-role', connectedWallet],
    queryFn: async () => {
      const roles = await base44.entities.UserRole.filter({ walletAddress: connectedWallet });
      return roles[0];
    },
    enabled: isConnected,
  });

  const { data: userEscrows = [] } = useQuery({
    queryKey: ['user-escrows', connectedWallet],
    queryFn: async () => {
      const allEscrows = await base44.entities.Escrow.list('-created_date', 200);
      return allEscrows.filter(
        e => e.seller === connectedWallet || e.buyer === connectedWallet
      );
    },
    enabled: isConnected,
    initialData: [],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ displayName }) => {
      if (userRoleData?.id) {
        return base44.entities.UserRole.update(userRoleData.id, { displayName });
      } else {
        return base44.entities.UserRole.create({
          walletAddress: connectedWallet,
          role: 'USER',
          displayName,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-role', connectedWallet]);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  if (!isConnected) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to view your profile.
        </AlertDescription>
      </Alert>
    );
  }

  const asSeller = userEscrows.filter(e => e.seller === connectedWallet);
  const asBuyer = userEscrows.filter(e => e.buyer === connectedWallet);
  const completedEscrows = userEscrows.filter(e => e.state === 'RESOLVED');
  const disputedEscrows = userEscrows.filter(e => e.state === 'DISPUTED' || e.disputeOutcome);

  const successRate = userEscrows.length > 0
    ? ((completedEscrows.length / userEscrows.length) * 100).toFixed(1)
    : 0;

  const disputeRate = userEscrows.length > 0
    ? ((disputedEscrows.length / userEscrows.length) * 100).toFixed(1)
    : 0;

  const handleSaveProfile = () => {
    updateRoleMutation.mutate({ displayName });
  };

  const formatAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-600">View and manage your account information</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 bg-gradient-to-br from-blue-600 to-indigo-600">
                <AvatarFallback className="text-white text-2xl font-bold">
                  {(userRoleData?.displayName || connectedWallet)?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter display name"
                      className="max-w-xs"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveProfile}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">
                        {userRoleData?.displayName || 'Anonymous User'}
                      </h2>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDisplayName(userRoleData?.displayName || '');
                          setIsEditing(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 font-mono">{formatAddress(connectedWallet)}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {userRole}
                      </Badge>
                      {userRole === 'ARBITRATOR' && (
                        <Badge className="bg-purple-100 text-purple-700">
                          <Shield className="w-3 h-3 mr-1" />
                          Arbitrator
                        </Badge>
                      )}
                      {userRole === 'ADMIN' && (
                        <Badge className="bg-red-100 text-red-700">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Trades</p>
                <p className="text-3xl font-bold mt-1">{userEscrows.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold mt-1">{completedEscrows.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold mt-1">{successRate}%</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dispute Rate</p>
                <p className="text-3xl font-bold mt-1">{disputeRate}%</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trade History */}
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({userEscrows.length})</TabsTrigger>
              <TabsTrigger value="seller">As Seller ({asSeller.length})</TabsTrigger>
              <TabsTrigger value="buyer">As Buyer ({asBuyer.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <TradeHistoryList escrows={userEscrows} currentWallet={connectedWallet} />
            </TabsContent>

            <TabsContent value="seller" className="mt-4">
              <TradeHistoryList escrows={asSeller} currentWallet={connectedWallet} />
            </TabsContent>

            <TabsContent value="buyer" className="mt-4">
              <TradeHistoryList escrows={asBuyer} currentWallet={connectedWallet} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function TradeHistoryList({ escrows, currentWallet }) {
  if (escrows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No trades yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {escrows.map((escrow) => (
        <div
          key={escrow.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold">
                {escrow.title || `Escrow ${escrow.escrowId?.slice(0, 8)}`}
              </h4>
              <StateBadge state={escrow.state} />
              <Badge variant="outline">
                {escrow.seller === currentWallet ? 'Seller' : 'Buyer'}
              </Badge>
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              <span className="font-medium">
                {escrow.amount} {escrow.tokenSymbol}
              </span>
              <span>•</span>
              <span>{format(new Date(escrow.created_date), 'PP')}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


Amend your Escrow Components Polish based on the following:

ChatBox:

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ChatBox({ escrowId, connectedWallet, escrow }) {
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', escrowId],
    queryFn: async () => {
      const msgs = await base44.entities.Message.filter({ escrowId });
      return msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!escrowId,
  });

  const sendMutation = useMutation({
    mutationFn: async (text) => {
      const senderRole = 
        escrow.seller === connectedWallet ? 'Seller' :
        escrow.buyer === connectedWallet ? 'Buyer' : 'Participant';
      
      return base44.entities.Message.create({
        escrowId,
        sender: connectedWallet,
        text,
        senderRole,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', escrowId]);
      setMessage('');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate(message);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Chat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80 pr-4 mb-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender === connectedWallet;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        isMe
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium opacity-75">
                          {msg.senderRole}
                        </span>
                        <span className="text-xs opacity-50">
                          {format(new Date(msg.created_date), 'HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm break-words">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sendMutation.isPending}
          />
          <Button type="submit" disabled={sendMutation.isPending || !message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

Dispute Pannel:

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Gavel, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function DisputePanel({ escrowId, escrowDbId, escrow, connectedWallet, userRole }) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [summary, setSummary] = useState('');
  const [arbitratorNote, setArbitratorNote] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState('');

  const isArbitrator = userRole === 'ARBITRATOR';
  const isSeller = escrow.seller === connectedWallet;
  const isBuyer = escrow.buyer === connectedWallet;
  const canOpenDispute = (isSeller || isBuyer) && escrow.state !== 'DISPUTED';

  const { data: dispute, isLoading } = useQuery({
    queryKey: ['dispute', escrowId],
    queryFn: async () => {
      const disputes = await base44.entities.Dispute.filter({ escrowId });
      return disputes[0];
    },
    enabled: !!escrowId,
  });

  const openDisputeMutation = useMutation({
    mutationFn: async ({ reason, summary }) => {
      // Create dispute record
      const dispute = await base44.entities.Dispute.create({
        escrowId,
        openedBy: connectedWallet,
        reason,
        summary,
        status: 'OPEN',
      });

      // Update escrow state
      await base44.entities.Escrow.update(escrowDbId, {
        state: 'DISPUTED',
      });

      return dispute;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dispute', escrowId]);
      queryClient.invalidateQueries(['escrow', escrowDbId]);
      toast.success('Dispute opened successfully');
      setReason('');
      setSummary('');
    },
    onError: () => {
      toast.error('Failed to open dispute');
    },
  });

  const resolveDisputeMutation = useMutation({
    mutationFn: async ({ outcome, note }) => {
      // Update dispute
      await base44.entities.Dispute.update(dispute.id, {
        status: 'RESOLVED',
        outcome,
        arbitratorNote: note,
        resolvedAt: new Date().toISOString(),
        arbitratorAssigned: connectedWallet,
      });

      // Update escrow
      await base44.entities.Escrow.update(escrowDbId, {
        state: 'RESOLVED',
        disputeOutcome: outcome,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dispute', escrowId]);
      queryClient.invalidateQueries(['escrow', escrowDbId]);
      toast.success('Dispute resolved successfully');
    },
    onError: () => {
      toast.error('Failed to resolve dispute');
    },
  });

  const handleOpenDispute = () => {
    if (!reason.trim() || !summary.trim()) {
      toast.error('Please provide reason and summary');
      return;
    }
    openDisputeMutation.mutate({ reason, summary });
  };

  const handleResolveDispute = () => {
    if (!selectedOutcome) {
      toast.error('Please select an outcome');
      return;
    }
    resolveDisputeMutation.mutate({ outcome: selectedOutcome, note: arbitratorNote });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  // Show dispute form if no dispute exists and user can open one
  if (!dispute && canOpenDispute) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            Open Dispute
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              Opening a dispute will freeze the escrow and require arbitrator intervention.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Brief reason for dispute..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="summary">Detailed Summary</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Provide detailed explanation..."
              rows={4}
            />
          </div>

          <Button
            onClick={handleOpenDispute}
            variant="destructive"
            className="w-full"
            disabled={openDisputeMutation.isPending}
          >
            {openDisputeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Opening Dispute...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Open Dispute
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show existing dispute info
  if (dispute) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {dispute.status === 'RESOLVED' ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                Dispute Resolved
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Dispute Details
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Opened By</p>
            <p className="font-medium">
              {dispute.openedBy === escrow.seller ? 'Seller' : 'Buyer'}
            </p>
            <p className="text-xs text-gray-500">
              {format(new Date(dispute.created_date), 'PPpp')}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Reason</p>
            <p className="text-sm">{dispute.reason}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Summary</p>
            <p className="text-sm">{dispute.summary}</p>
          </div>

          {dispute.status === 'RESOLVED' && (
            <>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">Outcome</p>
                <p className="font-semibold text-lg">
                  {dispute.outcome === 'BUYER_WINS' ? 'Buyer Wins' : 'Seller Wins'}
                </p>
              </div>
              {dispute.arbitratorNote && (
                <div>
                  <p className="text-sm text-gray-600">Arbitrator Note</p>
                  <p className="text-sm">{dispute.arbitratorNote}</p>
                </div>
              )}
            </>
          )}

          {/* Arbitrator Resolution Panel */}
          {isArbitrator && dispute.status !== 'RESOLVED' && (
            <div className="pt-4 border-t space-y-4">
              <Alert>
                <Gavel className="h-4 w-4" />
                <AlertDescription>
                  As an arbitrator, you can resolve this dispute
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="outcome">Resolution Outcome</Label>
                <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUYER_WINS">Buyer Wins</SelectItem>
                    <SelectItem value="SELLER_WINS">Seller Wins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="note">Decision Note</Label>
                <Textarea
                  id="note"
                  value={arbitratorNote}
                  onChange={(e) => setArbitratorNote(e.target.value)}
                  placeholder="Explain your decision..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleResolveDispute}
                className="w-full"
                disabled={resolveDisputeMutation.isPending}
              >
                {resolveDisputeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resolving...
                  </>
                ) : (
                  <>
                    <Gavel className="w-4 h-4 mr-2" />
                    Resolve Dispute
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}

Escrow Card:

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, User, Coins, MoreVertical, ExternalLink, Copy, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import StateBadge from './StateBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function EscrowCard({ escrow }) {
  const formatAddress = (address) => {
    if (!address) return 'Open';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyEscrowId = () => {
    navigator.clipboard.writeText(escrow.escrowId);
    toast.success('Escrow ID copied to clipboard');
  };

  const shareEscrow = () => {
    const url = `${window.location.origin}${createPageUrl('EscrowDetail')}?id=${escrow.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Escrow link copied to clipboard');
  };

  return (
    <Card className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group border-2 hover:border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate group-hover:text-blue-600 transition-colors">
              {escrow.title || `Escrow ${escrow.escrowId.slice(0, 8)}`}
            </h3>
            <p className="text-xs text-gray-500 mt-1 truncate font-mono">ID: {escrow.escrowId.slice(0, 16)}...</p>
          </div>
          <div className="flex items-center gap-2">
            <StateBadge state={escrow.state} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={copyEscrowId}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Escrow ID
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareEscrow}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('EscrowDetail') + `?id=${escrow.id}`} className="flex items-center">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Amount:</span>
            </div>
            <span className="font-semibold">
              {escrow.amount} {escrow.tokenSymbol || 'BNB'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Seller:</span>
              <p className="font-medium">{formatAddress(escrow.seller)}</p>
            </div>
            <div>
              <span className="text-gray-500">Buyer:</span>
              <p className="font-medium">{formatAddress(escrow.buyer)}</p>
            </div>
          </div>

          {escrow.feeAmount > 0 && (
            <div className="text-xs text-gray-500 pt-2 border-t">
              Fee: {escrow.feeAmount} {escrow.tokenSymbol || 'BNB'}
            </div>
          )}

          <Link to={createPageUrl('EscrowDetail') + `?id=${escrow.id}`}>
            <Button className="w-full mt-2" variant="outline">
              View Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
Escrow Timeline:

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, AlertCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const TIMELINE_STEPS = [
  { state: 'CREATED', label: 'Escrow Created' },
  { state: 'TAKEN', label: 'Taken by Buyer' },
  { state: 'FUNDED', label: 'Funded by Seller' },
  { state: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed' },
  { state: 'RESOLVED', label: 'Resolved' },
];

const STATE_ORDER = {
  CREATED: 0,
  TAKEN: 1,
  FUNDED: 2,
  PAYMENT_CONFIRMED: 3,
  DISPUTED: 4,
  RESOLVED: 5,
  CANCELLED: 5,
};

export default function EscrowTimeline({ escrow }) {
  const currentStep = STATE_ORDER[escrow.state] || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {TIMELINE_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            const isDisputed = escrow.state === 'DISPUTED' && step.state === 'PAYMENT_CONFIRMED';

            return (
              <div key={step.state} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted || isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={`w-0.5 h-12 ${
                        isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <p
                    className={`font-medium ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-sm text-gray-500 mt-1">Current step</p>
                  )}
                  {isDisputed && (
                    <p className="text-sm text-orange-600 mt-1">⚠️ Dispute opened</p>
                  )}
                </div>
              </div>
            );
          })}

          {escrow.state === 'DISPUTED' && (
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-500 text-white">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-orange-600">Dispute In Progress</p>
                <p className="text-sm text-gray-500 mt-1">Waiting for arbitrator decision</p>
              </div>
            </div>
          )}

          {escrow.state === 'CANCELLED' && (
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white">
                  <XCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-600">Escrow Cancelled</p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t text-xs text-gray-500">
            <p>Created: {format(new Date(escrow.created_date), 'PPpp')}</p>
            {escrow.fundedAt && (
              <p>Funded: {format(new Date(escrow.fundedAt), 'PPpp')}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

Evidence Pannel:

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, File, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function EvidencePanel({ escrowId, connectedWallet }) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');

  const { data: evidenceList = [], isLoading } = useQuery({
    queryKey: ['evidence', escrowId],
    queryFn: async () => {
      const items = await base44.entities.Evidence.filter({ escrowId });
      return items.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!escrowId,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, description }) => {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Create evidence record
      return base44.entities.Evidence.create({
        escrowId,
        uploader: connectedWallet,
        fileUrl: file_url,
        fileName: file.name,
        description,
        sha256: 'simulated-hash-' + Date.now(),
        uploaderRole: 'Participant',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['evidence', escrowId]);
      setSelectedFile(null);
      setDescription('');
      toast.success('Evidence uploaded successfully');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Failed to upload evidence');
    },
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync({ file: selectedFile, description });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Form */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <div>
            <Label htmlFor="file">Upload Evidence</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileSelect}
              accept="image/*,.pdf"
              disabled={isUploading}
            />
            {selectedFile && (
              <div className="flex items-center justify-between mt-2 p-2 bg-white rounded border">
                <span className="text-sm">{selectedFile.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this evidence..."
              rows={2}
              disabled={isUploading}
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Evidence
              </>
            )}
          </Button>
        </div>

        {/* Evidence List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
            </div>
          ) : evidenceList.length === 0 ? (
            <Alert>
              <AlertDescription>No evidence uploaded yet</AlertDescription>
            </Alert>
          ) : (
            evidenceList.map((evidence) => (
              <div
                key={evidence.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <File className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-sm">{evidence.fileName}</span>
                    </div>
                    {evidence.description && (
                      <p className="text-sm text-gray-600 mb-2">{evidence.description}</p>
                    )}
                    <div className="text-xs text-gray-500">
                      Uploaded by {evidence.uploaderRole} •{' '}
                      {format(new Date(evidence.created_date), 'PPp')}
                    </div>
                  </div>
                  <a
                    href={evidence.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

Next Action Engine:

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  HandCoins, 
  Lock, 
  CheckCircle, 
  Send, 
  AlertTriangle,
  Ban 
} from 'lucide-react';

/**
 * Deterministic Next Action Engine
 * Returns the appropriate action button based on escrow state and user role
 */
export function getNextAction(escrow, connectedWallet, userRole) {
  if (!escrow || !connectedWallet) return null;

  const isSeller = escrow.seller === connectedWallet;
  const isBuyer = escrow.buyer === connectedWallet;
  const isArbitrator = userRole === 'ARBITRATOR';
  const isAdmin = userRole === 'ADMIN';

  switch (escrow.state) {
    case 'CREATED':
      // Buyer can take the escrow
      if (!escrow.buyer || escrow.buyer === connectedWallet) {
        return {
          action: 'TAKE',
          label: 'Take Escrow',
          icon: HandCoins,
          variant: 'default',
          description: 'Accept this escrow and proceed to next step',
        };
      }
      return null;

    case 'TAKEN':
      // Seller can fund the escrow
      if (isSeller) {
        return {
          action: 'FUND',
          label: 'Fund Escrow',
          icon: Lock,
          variant: 'default',
          description: `Lock ${escrow.amount + escrow.feeAmount + escrow.sellerBond} ${escrow.tokenSymbol}`,
        };
      }
      return null;

    case 'FUNDED':
      // Buyer can confirm payment
      if (isBuyer) {
        return {
          action: 'CONFIRM_PAYMENT',
          label: 'Confirm Payment',
          icon: CheckCircle,
          variant: 'default',
          description: 'Confirm you have sent the fiat payment',
        };
      }
      // Seller or buyer can open dispute
      if (isSeller || isBuyer) {
        return {
          action: 'OPEN_DISPUTE',
          label: 'Open Dispute',
          icon: AlertTriangle,
          variant: 'destructive',
          description: 'Open a dispute if there are issues',
          secondary: true,
        };
      }
      return null;

    case 'PAYMENT_CONFIRMED':
      // Seller can release escrow
      if (isSeller) {
        return {
          action: 'RELEASE',
          label: 'Release Escrow',
          icon: Send,
          variant: 'default',
          description: 'Release crypto to buyer',
        };
      }
      // Seller or buyer can open dispute
      if (isSeller || isBuyer) {
        return {
          action: 'OPEN_DISPUTE',
          label: 'Open Dispute',
          icon: AlertTriangle,
          variant: 'destructive',
          description: 'Open a dispute if there are issues',
          secondary: true,
        };
      }
      return null;

    case 'DISPUTED':
      // Only arbitrators can resolve disputes
      if (isArbitrator) {
        return {
          action: 'RESOLVE_DISPUTE',
          label: 'Resolve Dispute',
          icon: CheckCircle,
          variant: 'default',
          description: 'Decide the outcome of this dispute',
        };
      }
      return null;

    case 'RESOLVED':
    case 'CANCELLED':
      // No actions available for completed escrows
      return null;

    default:
      return null;
  }
}

export default function NextActionButton({ escrow, connectedWallet, userRole, onAction }) {
  const nextAction = getNextAction(escrow, connectedWallet, userRole);

  if (!nextAction) return null;

  const Icon = nextAction.icon;

  return (
    <div className="space-y-2">
      <Button
        onClick={() => onAction(nextAction.action)}
        variant={nextAction.variant}
        size="lg"
        className="w-full"
      >
        <Icon className="w-5 h-5 mr-2" />
        {nextAction.label}
      </Button>
      {nextAction.description && (
        <p className="text-sm text-gray-600 text-center">
          {nextAction.description}
        </p>
      )}
    </div>
  );
}

Payment Instruction:

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentInstructionsPanel({ escrowId, escrow, connectedWallet }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const isSeller = escrow.seller === connectedWallet;
  const isBuyer = escrow.buyer === connectedWallet;
  const canView = isSeller || isBuyer;

  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    additionalInfo: '',
  });

  const { data: instructions, isLoading } = useQuery({
    queryKey: ['payment-instructions', escrowId],
    queryFn: async () => {
      const results = await base44.entities.PaymentInstruction.filter({ escrowId });
      if (results.length > 0) {
        setFormData({
          bankName: results[0].bankName || '',
          accountNumber: results[0].accountNumber || '',
          accountName: results[0].accountName || '',
          additionalInfo: results[0].additionalInfo || '',
        });
      }
      return results[0];
    },
    enabled: canView && !!escrowId,
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (instructions) {
        return base44.entities.PaymentInstruction.update(instructions.id, data);
      } else {
        return base44.entities.PaymentInstruction.create({
          escrowId,
          ...data,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payment-instructions', escrowId]);
      setIsEditing(false);
      toast.success('Payment instructions saved');
    },
    onError: () => {
      toast.error('Failed to save instructions');
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (!canView) {
    return (
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Payment instructions are only visible to escrow participants
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payment Instructions</CardTitle>
        {isSeller && !isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            {instructions ? 'Edit' : 'Add'} Instructions
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!instructions && !isEditing ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isSeller
                ? 'Add payment instructions for the buyer'
                : 'Waiting for seller to provide payment instructions'}
            </AlertDescription>
          </Alert>
        ) : isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="e.g., Chase Bank"
              />
            </div>

            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="Account number"
              />
            </div>

            <div>
              <Label htmlFor="accountName">Account Holder Name</Label>
              <Input
                id="accountName"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                placeholder="Account holder name"
              />
            </div>

            <div>
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                placeholder="Reference number, notes, etc."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Bank Name</p>
              <p className="font-medium">{instructions.bankName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Number</p>
              <p className="font-medium font-mono">{instructions.accountNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Holder Name</p>
              <p className="font-medium">{instructions.accountName}</p>
            </div>
            {instructions.additionalInfo && (
              <div>
                <p className="text-sm text-gray-600">Additional Information</p>
                <p className="text-sm">{instructions.additionalInfo}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

State Badge:

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, XCircle, Lock, FileCheck } from 'lucide-react';

const STATE_CONFIG = {
  CREATED: {
    label: 'Created',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: Clock,
  },
  TAKEN: {
    label: 'Taken',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: Lock,
  },
  FUNDED: {
    label: 'Funded',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: CheckCircle,
  },
  PAYMENT_CONFIRMED: {
    label: 'Payment Confirmed',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    icon: FileCheck,
  },
  DISPUTED: {
    label: 'Disputed',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    icon: AlertCircle,
  },
  RESOLVED: {
    label: 'Resolved',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: XCircle,
  },
};

export default function StateBadge({ state, showIcon = true }) {
  const config = STATE_CONFIG[state] || STATE_CONFIG.CREATED;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} border`}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
}


Amend your Market Place Components Polish based on the following:

Bulk Action Menu:

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Archive, Download, Share2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BulkActionsMenu({ 
  selectedEscrows = [], 
  onClearSelection,
  onExport,
  onArchive 
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const handleAction = (action, actionFn) => {
    setConfirmAction({ action, actionFn });
    setShowConfirm(true);
  };

  const executeAction = () => {
    if (confirmAction?.actionFn) {
      confirmAction.actionFn(selectedEscrows);
      onClearSelection();
      toast.success(`${confirmAction.action} completed for ${selectedEscrows.length} escrow(s)`);
    }
    setShowConfirm(false);
    setConfirmAction(null);
  };

  const handleExport = () => {
    const data = selectedEscrows.map(e => ({
      id: e.escrowId,
      title: e.title,
      amount: e.amount,
      token: e.tokenSymbol,
      state: e.state,
      seller: e.seller,
      buyer: e.buyer,
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `escrows-export-${Date.now()}.json`;
    a.click();
    
    toast.success(`Exported ${selectedEscrows.length} escrow(s)`);
  };

  const handleShare = () => {
    const ids = selectedEscrows.map(e => e.id).join(',');
    const url = `${window.location.origin}/explore?ids=${ids}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard');
  };

  if (selectedEscrows.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Checkbox 
          checked={true}
          onCheckedChange={onClearSelection}
        />
        <span className="font-medium text-sm">
          {selectedEscrows.length} selected
        </span>
        
        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAction('Archive', onArchive)}>
                <Archive className="mr-2 h-4 w-4" />
                Archive Selected
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onClearSelection}
                className="text-gray-600"
              >
                Clear Selection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm {confirmAction?.action}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmAction?.action?.toLowerCase()} {selectedEscrows.length} escrow(s)?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

command Palette:

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useWallet } from '@/components/wallet/WalletContext';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Home,
  Search,
  Plus,
  LayoutDashboard,
  Gavel,
  Shield,
  Wallet,
  LogOut,
  Settings,
  User,
} from 'lucide-react';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isConnected, connectedWallet, disconnectWallet, isArbitrator, isAdmin } = useWallet();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate(createPageUrl('Home')))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate(createPageUrl('Marketplace')))}>
            <Search className="mr-2 h-4 w-4" />
            <span>P2P Marketplace</span>
          </CommandItem>
          {isConnected && (
            <>
              <CommandItem onSelect={() => runCommand(() => navigate(createPageUrl('Dashboard')))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>My Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate(createPageUrl('Profile')))}>
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate(createPageUrl('CreateEscrow')))}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Create New Escrow</span>
              </CommandItem>
            </>
          )}
        </CommandGroup>

        {isArbitrator && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Arbitrator">
              <CommandItem onSelect={() => runCommand(() => navigate(createPageUrl('Arbitration')))}>
                <Gavel className="mr-2 h-4 w-4" />
                <span>Arbitration Console</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {isAdmin && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Admin">
              <CommandItem onSelect={() => runCommand(() => navigate(createPageUrl('Admin')))}>
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Console</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Quick Filters">
          <CommandItem onSelect={() => runCommand(() => navigate(createPageUrl('Marketplace') + '?tab=buy'))}>
            <span>Browse Buy Offers</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate(createPageUrl('Marketplace') + '?tab=sell'))}>
            <span>Browse Sell Offers</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate(createPageUrl('Explore') + '?state=DISPUTED'))}>
            <span>Show Disputed Escrows</span>
          </CommandItem>
        </CommandGroup>

        {isConnected && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Account">
              <CommandItem onSelect={() => runCommand(disconnectWallet)}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Disconnect Wallet</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

Fee Calculator:

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function FeeCalculator({ onApplyValues }) {
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('BNB');
  const [sellerBondPercent, setSellerBondPercent] = useState(5);
  const [buyerBondPercent, setBuyerBondPercent] = useState(5);

  const platformFeePercent = 2;
  const numAmount = parseFloat(amount) || 0;
  
  const platformFee = numAmount * (platformFeePercent / 100);
  const sellerBond = numAmount * (sellerBondPercent / 100);
  const buyerBond = numAmount * (buyerBondPercent / 100);
  const sellerTotal = numAmount + platformFee + sellerBond;
  const buyerTotal = buyerBond;

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          Fee Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              step="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label>Token</Label>
            <Select value={token} onValueChange={setToken}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BNB">BNB</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="BUSD">BUSD</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center gap-1">
              Seller Bond %
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Security deposit from seller</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              type="number"
              value={sellerBondPercent}
              onChange={(e) => setSellerBondPercent(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
            />
          </div>
          <div>
            <Label className="flex items-center gap-1">
              Buyer Bond %
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Security deposit from buyer</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              type="number"
              value={buyerBondPercent}
              onChange={(e) => setBuyerBondPercent(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
            />
          </div>
        </div>

        {numAmount > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee ({platformFeePercent}%)</span>
                <span className="font-semibold">{platformFee.toFixed(4)} {token}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Seller Bond ({sellerBondPercent}%)</span>
                <span className="font-semibold">{sellerBond.toFixed(4)} {token}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Buyer Bond ({buyerBondPercent}%)</span>
                <span className="font-semibold">{buyerBond.toFixed(4)} {token}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Seller Total</span>
                <span className="text-blue-600">{sellerTotal.toFixed(4)} {token}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Buyer Total</span>
                <span className="text-green-600">{buyerTotal.toFixed(4)} {token}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

Notification Centre:

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWallet } from '@/components/wallet/WalletContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationCenter() {
  const { connectedWallet, isConnected } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  const { data: escrows = [] } = useQuery({
    queryKey: ['notifications', connectedWallet],
    queryFn: () => base44.entities.Escrow.list('-updated_date', 50),
    enabled: isConnected,
    refetchInterval: 30000, // Refresh every 30s
  });

  const notifications = escrows
    .filter(e => e.seller === connectedWallet || e.buyer === connectedWallet)
    .slice(0, 10)
    .map(e => {
      let type = 'info';
      let message = '';
      let icon = Clock;

      if (e.state === 'CREATED' && e.seller === connectedWallet) {
        message = 'Your escrow is waiting for a buyer';
        icon = Clock;
        type = 'pending';
      } else if (e.state === 'TAKEN' && e.seller === connectedWallet) {
        message = 'Buyer has taken your escrow';
        icon = TrendingUp;
        type = 'success';
      } else if (e.state === 'FUNDED' && e.buyer === connectedWallet) {
        message = 'Escrow funded, confirm payment';
        icon = CheckCircle;
        type = 'action';
      } else if (e.state === 'DISPUTED') {
        message = 'Escrow is in dispute';
        icon = AlertCircle;
        type = 'warning';
      } else if (e.state === 'RESOLVED') {
        message = 'Escrow completed successfully';
        icon = CheckCircle;
        type = 'success';
      }

      return {
        id: e.id,
        escrowId: e.escrowId,
        title: e.title || `Escrow ${e.escrowId?.slice(0, 8)}`,
        message,
        timestamp: e.updated_date,
        type,
        icon,
        read: false,
      };
    });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isConnected) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-semibold flex items-center justify-between">
            <span>Notifications</span>
            <Badge variant="secondary">{notifications.length}</Badge>
          </h4>
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => {
                const Icon = notif.icon;
                const colorClasses = {
                  success: 'bg-green-100 text-green-600',
                  warning: 'bg-red-100 text-red-600',
                  action: 'bg-blue-100 text-blue-600',
                  pending: 'bg-yellow-100 text-yellow-600',
                  info: 'bg-gray-100 text-gray-600',
                }[notif.type];

                return (
                  <div key={notif.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{notif.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

Order Templates:

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Shield, Sparkles } from 'lucide-react';

const templates = [
  {
    id: 'quick',
    name: 'Quick Trade',
    icon: Zap,
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    iconColor: 'text-blue-600',
    description: 'Standard escrow with 24h windows',
    defaults: {
      paymentWindow: 24,
      releaseWindow: 24,
      sellerBond: 0,
      buyerBond: 0,
      feeAmount: 0.01
    }
  },
  {
    id: 'secure',
    name: 'Secure Trade',
    icon: Shield,
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
    iconColor: 'text-green-600',
    description: 'With security bonds & extended windows',
    defaults: {
      paymentWindow: 48,
      releaseWindow: 48,
      sellerBond: 0.05,
      buyerBond: 0.05,
      feeAmount: 0.01
    },
    badge: 'Recommended'
  },
  {
    id: 'express',
    name: 'Express Trade',
    icon: TrendingUp,
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    iconColor: 'text-purple-600',
    description: 'Fast execution with 12h windows',
    defaults: {
      paymentWindow: 12,
      releaseWindow: 12,
      sellerBond: 0,
      buyerBond: 0,
      feeAmount: 0.015
    }
  },
  {
    id: 'premium',
    name: 'Premium Trade',
    icon: Sparkles,
    color: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
    iconColor: 'text-amber-600',
    description: 'High-value with max protection',
    defaults: {
      paymentWindow: 72,
      releaseWindow: 72,
      sellerBond: 0.1,
      buyerBond: 0.1,
      feeAmount: 0.008
    },
    badge: 'Best Security'
  }
];

export default function OrderTemplates({ onSelect }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {templates.map((template) => {
        const Icon = template.icon;
        return (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all ${template.color} border-2`}
            onClick={() => onSelect(template)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Icon className={`w-5 h-5 ${template.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    {template.badge && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {template.badge}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {template.description}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div>Payment: {template.defaults.paymentWindow}h</div>
                <div>Release: {template.defaults.releaseWindow}h</div>
                {template.defaults.sellerBond > 0 && (
                  <div>Seller Bond: {template.defaults.sellerBond * 100}%</div>
                )}
                {template.defaults.buyerBond > 0 && (
                  <div>Buyer Bond: {template.defaults.buyerBond * 100}%</div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export { templates };

Quick Action Drawer:

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useWallet } from '@/components/wallet/WalletContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Menu, 
  Plus, 
  Search, 
  LayoutDashboard, 
  Gavel,
  Shield,
  LogOut,
  User
} from 'lucide-react';

export default function QuickActionsDrawer() {
  const navigate = useNavigate();
  const { isConnected, disconnectWallet, isArbitrator, isAdmin } = useWallet();
  const [open, setOpen] = React.useState(false);

  const actions = [
    { icon: Search, label: 'Explore Market', path: 'Explore', color: 'text-blue-600', public: true },
    { icon: Plus, label: 'Create Escrow', path: 'CreateEscrow', color: 'text-green-600', requireAuth: true },
    { icon: LayoutDashboard, label: 'My Dashboard', path: 'Dashboard', color: 'text-purple-600', requireAuth: true },
  ];

  if (isArbitrator) {
    actions.push({ icon: Gavel, label: 'Arbitration', path: 'Arbitration', color: 'text-amber-600', requireAuth: true });
  }

  if (isAdmin) {
    actions.push({ icon: Shield, label: 'Admin Panel', path: 'Admin', color: 'text-red-600', requireAuth: true });
  }

  const handleAction = (path) => {
    navigate(createPageUrl(path));
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Quick Actions</SheetTitle>
          <SheetDescription>
            Navigate and manage your escrows
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-2">
          {actions.map((action) => {
            if (action.requireAuth && !isConnected) return null;
            const Icon = action.icon;
            
            return (
              <Button
                key={action.path}
                variant="ghost"
                className="w-full justify-start h-14 text-left"
                onClick={() => handleAction(action.path)}
              >
                <Icon className={`w-5 h-5 mr-3 ${action.color}`} />
                <span className="font-medium">{action.label}</span>
              </Button>
            );
          })}

          {isConnected && (
            <>
              <div className="border-t my-4" />
              <Button
                variant="ghost"
                className="w-full justify-start h-14 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  disconnectWallet();
                  setOpen(false);
                }}
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span className="font-medium">Disconnect Wallet</span>
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

Quick Filters:

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, SortAsc, SortDesc } from 'lucide-react';

export default function QuickFilters({ 
  stateFilter, 
  setStateFilter,
  tokenFilter,
  setTokenFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  availableTokens = ['BNB', 'USDT', 'BUSD']
}) {
  const activeFiltersCount = [
    stateFilter !== 'all' ? 1 : 0,
    tokenFilter !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-wrap gap-2">
      {/* State Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            State
            {stateFilter !== 'all' && (
              <Badge variant="secondary" className="ml-2 h-5 px-1">1</Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Filter by State</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={stateFilter === 'all'}
            onCheckedChange={() => setStateFilter('all')}
          >
            All States
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={stateFilter === 'CREATED'}
            onCheckedChange={() => setStateFilter('CREATED')}
          >
            Created (Available)
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={stateFilter === 'TAKEN'}
            onCheckedChange={() => setStateFilter('TAKEN')}
          >
            Taken
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={stateFilter === 'FUNDED'}
            onCheckedChange={() => setStateFilter('FUNDED')}
          >
            Funded
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={stateFilter === 'PAYMENT_CONFIRMED'}
            onCheckedChange={() => setStateFilter('PAYMENT_CONFIRMED')}
          >
            Payment Confirmed
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={stateFilter === 'DISPUTED'}
            onCheckedChange={() => setStateFilter('DISPUTED')}
          >
            Disputed
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={stateFilter === 'RESOLVED'}
            onCheckedChange={() => setStateFilter('RESOLVED')}
          >
            Resolved
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Token Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Token
            {tokenFilter !== 'all' && (
              <Badge variant="secondary" className="ml-2 h-5 px-1">1</Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Filter by Token</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={tokenFilter === 'all'}
            onCheckedChange={() => setTokenFilter('all')}
          >
            All Tokens
          </DropdownMenuCheckboxItem>
          {availableTokens.map(token => (
            <DropdownMenuCheckboxItem
              key={token}
              checked={tokenFilter === token}
              onCheckedChange={() => setTokenFilter(token)}
            >
              {token}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
            Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={sortBy === 'created'}
            onCheckedChange={() => setSortBy('created')}
          >
            Date Created
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortBy === 'amount'}
            onCheckedChange={() => setSortBy('amount')}
          >
            Amount
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortBy === 'state'}
            onCheckedChange={() => setSortBy('state')}
          >
            State
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={sortOrder === 'desc'}
            onCheckedChange={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            Descending
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortOrder === 'asc'}
            onCheckedChange={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          >
            Ascending
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setStateFilter('all');
            setTokenFilter('all');
          }}
        >
          Clear {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}
        </Button>
      )}
    </div>
  );
}

Quick Start Menu:

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuickStatsMenu() {
  const { data: escrows = [], isLoading } = useQuery({
    queryKey: ['escrows'],
    queryFn: () => base44.entities.Escrow.list('-created_date', 1000),
    initialData: [],
  });

  const stats = {
    total: escrows.length,
    active: escrows.filter(e => ['TAKEN', 'FUNDED', 'PAYMENT_CONFIRMED'].includes(e.state)).length,
    available: escrows.filter(e => e.state === 'CREATED' && !e.buyer).length,
    disputed: escrows.filter(e => e.state === 'DISPUTED').length,
    resolved: escrows.filter(e => e.state === 'RESOLVED').length,
    totalVolume: escrows.reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2),
  };

  const volumeByToken = escrows.reduce((acc, e) => {
    const token = e.tokenSymbol || 'BNB';
    acc[token] = (acc[token] || 0) + (e.amount || 0);
    return acc;
  }, {});

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <BarChart3 className="w-4 h-4 mr-2" />
          Market Stats
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Platform Overview
            </h4>
            
            {isLoading ? (
              <div className="space-y-2">
                {Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="pt-4 pb-3 px-3">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs text-gray-600">Total Escrows</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4 pb-3 px-3">
                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    <div className="text-xs text-gray-600">Active</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4 pb-3 px-3">
                    <div className="text-2xl font-bold text-blue-600">{stats.available}</div>
                    <div className="text-xs text-gray-600">Available</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4 pb-3 px-3">
                    <div className="text-2xl font-bold text-red-600">{stats.disputed}</div>
                    <div className="text-xs text-gray-600">Disputed</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="pt-3 border-t">
            <h4 className="font-semibold mb-2 text-sm">Volume by Token</h4>
            <div className="space-y-2">
              {Object.entries(volumeByToken).map(([token, volume]) => (
                <div key={token} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{token}</span>
                  <span className="font-semibold">{volume.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

Recent Activity:

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RecentActivity({ limit = 10 }) {
  const { data: escrows = [], isLoading } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: () => base44.entities.Escrow.list('-updated_date', limit),
    refetchInterval: 15000, // Refresh every 15s
  });

  const getActivityText = (escrow) => {
    const actions = {
      CREATED: 'created new escrow',
      TAKEN: 'joined escrow',
      FUNDED: 'funded escrow',
      PAYMENT_CONFIRMED: 'confirmed payment',
      DISPUTED: 'opened dispute',
      RESOLVED: 'completed escrow',
    };
    return actions[escrow.state] || 'updated escrow';
  };

  const getStateColor = (state) => {
    const colors = {
      CREATED: 'bg-blue-100 text-blue-700',
      TAKEN: 'bg-purple-100 text-purple-700',
      FUNDED: 'bg-green-100 text-green-700',
      PAYMENT_CONFIRMED: 'bg-indigo-100 text-indigo-700',
      DISPUTED: 'bg-red-100 text-red-700',
      RESOLVED: 'bg-emerald-100 text-emerald-700',
    };
    return colors[state] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : escrows.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {escrows.map((escrow) => (
                <Link
                  key={escrow.id}
                  to={createPageUrl('EscrowDetail') + `?id=${escrow.id}`}
                  className="block"
                >
                  <div className="p-3 rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-blue-300 transition-all group">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate group-hover:text-blue-600 transition-colors">
                          {escrow.title || `Escrow ${escrow.escrowId?.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {getActivityText(escrow)}
                        </p>
                      </div>
                      <Badge className={`text-xs ${getStateColor(escrow.state)}`}>
                        {escrow.state}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{escrow.amount} {escrow.tokenSymbol}</span>
                      <div className="flex items-center gap-1">
                        <span>{formatDistanceToNow(new Date(escrow.updated_date), { addSuffix: true })}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

Token Presets:

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Coins, ChevronDown } from 'lucide-react';

const tokens = [
  { symbol: 'BNB', name: 'Binance Coin', address: '0x0', decimals: 18 },
  { symbol: 'USDT', name: 'Tether USD', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
  { symbol: 'BUSD', name: 'Binance USD', address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', decimals: 18 },
  { symbol: 'USDC', name: 'USD Coin', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18 },
];

const amountPresets = {
  BNB: [0.1, 0.5, 1, 2, 5],
  USDT: [50, 100, 500, 1000, 5000],
  BUSD: [50, 100, 500, 1000, 5000],
  USDC: [50, 100, 500, 1000, 5000],
};

export default function TokenPresets({ selectedToken, onTokenSelect, onAmountSelect }) {
  const currentToken = tokens.find(t => t.symbol === selectedToken) || tokens[0];
  const presets = amountPresets[selectedToken] || [];

  return (
    <div className="space-y-4">
      {/* Token Selector */}
      <div>
        <label className="text-sm font-medium mb-2 block">Select Token</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tokens.map((token) => (
            <Button
              key={token.symbol}
              variant={selectedToken === token.symbol ? 'default' : 'outline'}
              onClick={() => onTokenSelect(token)}
              className="w-full"
            >
              <Coins className="w-4 h-4 mr-2" />
              {token.symbol}
            </Button>
          ))}
        </div>
      </div>

      {/* Amount Presets */}
      {presets.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Quick Amounts</label>
          <div className="flex flex-wrap gap-2">
            {presets.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => onAmountSelect(amount)}
              >
                {amount} {selectedToken}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { tokens, amountPresets };

User Panel:

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWallet } from '@/components/wallet/WalletContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Award,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function UserStatsPanel() {
  const { connectedWallet, isConnected } = useWallet();

  const { data: escrows = [] } = useQuery({
    queryKey: ['userEscrows', connectedWallet],
    queryFn: () => base44.entities.Escrow.list('-created_date', 1000),
    enabled: isConnected,
  });

  const userEscrows = escrows.filter(
    e => e.seller === connectedWallet || e.buyer === connectedWallet
  );

  const stats = {
    total: userEscrows.length,
    asSeller: userEscrows.filter(e => e.seller === connectedWallet).length,
    asBuyer: userEscrows.filter(e => e.buyer === connectedWallet).length,
    completed: userEscrows.filter(e => e.state === 'RESOLVED').length,
    disputed: userEscrows.filter(e => e.state === 'DISPUTED').length,
    totalVolume: userEscrows.reduce((sum, e) => sum + (e.amount || 0), 0),
  };

  const successRate = stats.total > 0 
    ? ((stats.completed / stats.total) * 100).toFixed(1)
    : 0;

  const reputation = stats.total < 5 ? 'New' 
    : stats.total < 20 ? 'Bronze'
    : stats.total < 50 ? 'Silver'
    : stats.total < 100 ? 'Gold'
    : 'Platinum';

  if (!isConnected) return null;

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Your Statistics
          </span>
          <Badge variant="outline" className="text-sm">
            {reputation}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600">Total Trades</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-600">As Seller</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.asSeller}</p>
          </div>

          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-gray-600">As Buyer</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.asBuyer}</p>
          </div>
        </div>

        {/* Success Rate */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Success Rate</span>
            <span className="font-bold text-green-600">{successRate}%</span>
          </div>
          <Progress value={parseFloat(successRate)} className="h-3" />
        </div>

        {/* Disputes */}
        {stats.disputed > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-red-700">{stats.disputed}</span>
              <span className="text-red-600"> disputed transaction{stats.disputed !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* Total Volume */}
        <div className="pt-4 border-t">
          <p className="text-xs text-gray-600 mb-1">Total Trading Volume</p>
          <p className="text-xl font-bold">{stats.totalVolume.toFixed(4)} BNB</p>
        </div>
      </CardContent>
    </Card>
  );
}

Amend your Wallet Components Polish based on the following:

Wallet Context:

import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const WalletContext = createContext();

// Mock wallets for testing different roles
export const MOCK_WALLETS = {
  SELLER: '0x1111111111111111111111111111111111111111',
  BUYER: '0x2222222222222222222222222222222222222222',
  ARBITRATOR: '0x3333333333333333333333333333333333333333',
  ADMIN: '0x4444444444444444444444444444444444444444',
  USER1: '0x5555555555555555555555555555555555555555',
  USER2: '0x6666666666666666666666666666666666666666',
};

export function WalletProvider({ children }) {
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [userRole, setUserRole] = useState('USER');
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async (address) => {
    setIsLoading(true);
    try {
      // Check if user role exists
      const roles = await base44.entities.UserRole.filter({ walletAddress: address });
      
      if (roles && roles.length > 0) {
        setUserRole(roles[0].role);
      } else {
        // Create default USER role
        await base44.entities.UserRole.create({
          walletAddress: address,
          role: 'USER'
        });
        setUserRole('USER');
      }
      
      setConnectedWallet(address);
      localStorage.setItem('connectedWallet', address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setConnectedWallet(null);
    setUserRole('USER');
    localStorage.removeItem('connectedWallet');
  };

  useEffect(() => {
    // Auto-connect if wallet was connected before
    const savedWallet = localStorage.getItem('connectedWallet');
    if (savedWallet) {
      connectWallet(savedWallet);
    }
  }, []);

  const value = {
    connectedWallet,
    userRole,
    isLoading,
    connectWallet,
    disconnectWallet,
    isConnected: !!connectedWallet,
    isArbitrator: userRole === 'ARBITRATOR',
    isAdmin: userRole === 'ADMIN',
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}

Wallet Selector:

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Wallet, LogOut, User } from 'lucide-react';
import { useWallet, MOCK_WALLETS } from './WalletContext';
import { Badge } from '@/components/ui/badge';

export default function WalletSelector() {
  const { connectedWallet, userRole, connectWallet, disconnectWallet, isConnected } = useWallet();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletLabel = (address) => {
    const entry = Object.entries(MOCK_WALLETS).find(([_, addr]) => addr === address);
    return entry ? entry[0] : 'UNKNOWN';
  };

  if (!isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-xs text-gray-500">Select a test wallet:</div>
          {Object.entries(MOCK_WALLETS).map(([label, address]) => (
            <DropdownMenuItem key={address} onClick={() => connectWallet(address)}>
              <User className="h-4 w-4 mr-2" />
              <div className="flex flex-col">
                <span className="font-medium">{label}</span>
                <span className="text-xs text-gray-500">{formatAddress(address)}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wallet className="h-4 w-4" />
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className="text-xs">{getWalletLabel(connectedWallet)}</span>
              <Badge variant="secondary" className="text-xs">
                {userRole}
              </Badge>
            </div>
            <span className="text-xs text-gray-500">{formatAddress(connectedWallet)}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{getWalletLabel(connectedWallet)}</p>
          <p className="text-xs text-gray-500">{connectedWallet}</p>
          <Badge className="mt-2" variant="outline">
            {userRole}
          </Badge>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnectWallet} className="text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

Amend your Entities Polish based on the following:

Escrow:

{
  "name": "Escrow",
  "type": "object",
  "properties": {
    "escrowId": {
      "type": "string",
      "description": "Unique identifier for the escrow"
    },
    "seller": {
      "type": "string",
      "description": "Wallet address of seller"
    },
    "buyer": {
      "type": "string",
      "description": "Wallet address of buyer"
    },
    "tokenKey": {
      "type": "string",
      "description": "Token address (0x0 for native)"
    },
    "tokenSymbol": {
      "type": "string",
      "description": "Token symbol like BNB, USDT"
    },
    "amount": {
      "type": "number",
      "description": "Principal amount"
    },
    "feeAmount": {
      "type": "number",
      "description": "Platform fee"
    },
    "sellerBond": {
      "type": "number",
      "description": "Seller security bond"
    },
    "buyerBond": {
      "type": "number",
      "description": "Buyer security bond"
    },
    "state": {
      "type": "string",
      "enum": [
        "CREATED",
        "TAKEN",
        "FUNDED",
        "PAYMENT_CONFIRMED",
        "DISPUTED",
        "RESOLVED",
        "CANCELLED"
      ],
      "default": "CREATED"
    },
    "paymentWindow": {
      "type": "number",
      "description": "Hours for payment"
    },
    "releaseWindow": {
      "type": "number",
      "description": "Hours for release"
    },
    "fundedAt": {
      "type": "string",
      "format": "date-time",
      "description": "When escrow was funded"
    },
    "title": {
      "type": "string",
      "description": "Escrow title/description"
    },
    "disputeOutcome": {
      "type": "string",
      "enum": [
        "",
        "BUYER_WINS",
        "SELLER_WINS"
      ],
      "description": "Dispute resolution outcome"
    }
  },
  "required": [
    "escrowId",
    "seller",
    "tokenKey",
    "amount",
    "state"
  ],
  "rls": {
    "create": {
      "user_condition": {
        "role": {
          "$ne": "guest"
        }
      }
    },
    "read": {
      "$or": [
        {
          "state": "CREATED",
          "buyer": null
        },
        {
          "seller": "{{user.data.walletAddress}}"
        },
        {
          "buyer": "{{user.data.walletAddress}}"
        },
        {
          "user_condition": {
            "role": "arbitrator"
          }
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "update": {
      "$or": [
        {
          "seller": "{{user.data.walletAddress}}"
        },
        {
          "buyer": "{{user.data.walletAddress}}"
        },
        {
          "user_condition": {
            "role": "arbitrator"
          }
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "delete": {
      "$or": [
        {
          "seller": "{{user.data.walletAddress}}",
          "state": "CREATED",
          "buyer": null
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    }
  }
}

Message:

{
  "name": "Message",
  "type": "object",
  "properties": {
    "escrowId": {
      "type": "string",
      "description": "Associated escrow ID"
    },
    "sender": {
      "type": "string",
      "description": "Wallet address of sender"
    },
    "text": {
      "type": "string",
      "description": "Message content"
    },
    "senderRole": {
      "type": "string",
      "description": "Role label like Seller, Buyer, Arbitrator"
    }
  },
  "required": [
    "escrowId",
    "sender",
    "text"
  ],
  "rls": {
    "create": {
      "$or": [
        {
          "sender": "{{user.data.walletAddress}}"
        },
        {
          "user_condition": {
            "role": "arbitrator"
          }
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "read": {
      "$or": [
        {
          "sender": "{{user.data.walletAddress}}"
        },
        {
          "user_condition": {
            "role": "arbitrator"
          }
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "update": {
      "$or": [
        {
          "sender": "{{user.data.walletAddress}}"
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "delete": {
      "user_condition": {
        "role": "admin"
      }
    }
  }
}

Evidence:

{
  "name": "Evidence",
  "type": "object",
  "properties": {
    "escrowId": {
      "type": "string",
      "description": "Associated escrow ID"
    },
    "uploader": {
      "type": "string",
      "description": "Wallet address of uploader"
    },
    "fileUrl": {
      "type": "string",
      "description": "URL to uploaded file"
    },
    "fileName": {
      "type": "string",
      "description": "Original file name"
    },
    "description": {
      "type": "string",
      "description": "Evidence description"
    },
    "sha256": {
      "type": "string",
      "description": "File hash for integrity"
    },
    "uploaderRole": {
      "type": "string",
      "description": "Role of uploader"
    }
  },
  "required": [
    "escrowId",
    "uploader",
    "fileUrl"
  ],
  "rls": {
    "create": {
      "$or": [
        {
          "uploader": "{{user.data.walletAddress}}"
        },
        {
          "user_condition": {
            "role": "arbitrator"
          }
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "read": {
      "$or": [
        {
          "uploader": "{{user.data.walletAddress}}"
        },
        {
          "user_condition": {
            "role": "arbitrator"
          }
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "update": {
      "$or": [
        {
          "uploader": "{{user.data.walletAddress}}"
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "delete": {
      "user_condition": {
        "role": "admin"
      }
    }
  }
}

Dispute:

{
  "name": "Dispute",
  "type": "object",
  "properties": {
    "escrowId": {
      "type": "string",
      "description": "Associated escrow ID"
    },
    "openedBy": {
      "type": "string",
      "description": "Wallet address who opened dispute"
    },
    "reason": {
      "type": "string",
      "description": "Reason for dispute"
    },
    "summary": {
      "type": "string",
      "description": "Detailed summary"
    },
    "status": {
      "type": "string",
      "enum": [
        "OPEN",
        "UNDER_REVIEW",
        "RESOLVED"
      ],
      "default": "OPEN"
    },
    "arbitratorAssigned": {
      "type": "string",
      "description": "Assigned arbitrator wallet"
    },
    "arbitratorNote": {
      "type": "string",
      "description": "Internal arbitrator notes"
    },
    "outcome": {
      "type": "string",
      "enum": [
        "",
        "BUYER_WINS",
        "SELLER_WINS"
      ]
    },
    "resolvedAt": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": [
    "escrowId",
    "openedBy",
    "reason"
  ],
  "rls": {
    "create": {
      "$or": [
        {
          "openedBy": "{{user.data.walletAddress}}"
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "read": {
      "$or": [
        {
          "openedBy": "{{user.data.walletAddress}}"
        },
        {
          "arbitratorAssigned": "{{user.data.walletAddress}}"
        },
        {
          "user_condition": {
            "role": "arbitrator"
          }
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "update": {
      "$or": [
        {
          "openedBy": "{{user.data.walletAddress}}"
        },
        {
          "arbitratorAssigned": "{{user.data.walletAddress}}"
        },
        {
          "user_condition": {
            "role": "arbitrator"
          }
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "delete": {
      "user_condition": {
        "role": "admin"
      }
    }
  }
}


Payment Instruction:

{
  "name": "PaymentInstruction",
  "type": "object",
  "properties": {
    "escrowId": {
      "type": "string",
      "description": "Associated escrow ID"
    },
    "bankName": {
      "type": "string",
      "description": "Bank name"
    },
    "accountNumber": {
      "type": "string",
      "description": "Account number"
    },
    "accountName": {
      "type": "string",
      "description": "Account holder name"
    },
    "additionalInfo": {
      "type": "string",
      "description": "Additional payment details"
    }
  },
  "required": [
    "escrowId"
  ],
  "rls": {
    "create": {
      "created_by": "{{user.email}}"
    },
    "read": {
      "created_by": "{{user.email}}"
    },
    "update": {
      "created_by": "{{user.email}}"
    },
    "delete": {
      "user_condition": {
        "role": "admin"
      }
    }
  }
}

Users:

{
  "name": "UserRole",
  "type": "object",
  "properties": {
    "walletAddress": {
      "type": "string",
      "description": "User wallet address"
    },
    "role": {
      "type": "string",
      "enum": [
        "USER",
        "ARBITRATOR",
        "ADMIN"
      ],
      "default": "USER"
    },
    "displayName": {
      "type": "string",
      "description": "Optional display name"
    }
  },
  "required": [
    "walletAddress",
    "role"
  ],
  "rls": {
    "create": {
      "user_condition": {
        "role": "admin"
      }
    },
    "read": {
      "$or": [
        {
          "walletAddress": "{{user.data.walletAddress}}"
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "update": {
      "$or": [
        {
          "walletAddress": "{{user.data.walletAddress}}"
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "delete": {
      "user_condition": {
        "role": "admin"
      }
    }
  }
}

Amend your Layout Polish based on the following:

import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Search, 
  Plus, 
  LayoutDashboard, 
  Gavel, 
  Shield,
  Command
} from 'lucide-react';
import WalletSelector from '@/components/wallet/WalletSelector';
import CommandPalette from '@/components/marketplace/CommandPalette';
import QuickStatsMenu from '@/components/marketplace/QuickStatsMenu';
import NotificationCenter from '@/components/marketplace/NotificationCenter';
import QuickActionsDrawer from '@/components/marketplace/QuickActionsDrawer';
import { useWallet, WalletProvider } from '@/components/wallet/WalletContext';

function LayoutContent({ children, currentPageName }) {
  const { isConnected, userRole, isArbitrator, isAdmin } = useWallet();

  const navigation = [
    { name: 'Home', path: 'Home', icon: Home, public: true },
    { name: 'Marketplace', path: 'Marketplace', icon: Search, public: true },
  ];

  if (isConnected) {
    navigation.push(
      { name: 'Dashboard', path: 'Dashboard', icon: LayoutDashboard },
      { name: 'Create Escrow', path: 'CreateEscrow', icon: Plus }
    );
  }

  if (isArbitrator) {
    navigation.push({ name: 'Arbitration', path: 'Arbitration', icon: Gavel });
  }

  if (isAdmin) {
    navigation.push({ name: 'Admin', path: 'Admin', icon: Shield });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <CommandPalette />
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to={createPageUrl('Home')} className="flex items-center gap-2 group">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Trustfy
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">BETA</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {navigation.map((item) => {
                  if (!item.public && !isConnected) return null;
                  
                  const Icon = item.icon;
                  const isActive = currentPageName === item.path;
                  
                  return (
                    <Link key={item.path} to={createPageUrl(item.path)}>
                      <Button 
                        variant={isActive ? 'default' : 'ghost'} 
                        className="gap-2"
                        size="sm"
                      >
                        <Icon className="w-4 h-4" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <QuickActionsDrawer />
              <QuickStatsMenu />
              {isConnected && <NotificationCenter />}
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex gap-2"
                onClick={() => {
                  const event = new KeyboardEvent('keydown', {
                    key: 'k',
                    metaKey: true,
                    bubbles: true
                  });
                  document.dispatchEvent(event);
                }}
              >
                <Command className="w-4 h-4" />
                <span className="text-xs text-gray-500">⌘K</span>
              </Button>
              <WalletSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-slate-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">Trustfy</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Secure P2P escrow platform on BSC. Trade with confidence using smart contract protection.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div>Binance Smart Chain</div>
                <div>2% Platform Fee</div>
                <div>24/7 Arbitration</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-400">Operational</span>
                </div>
                <div className="text-gray-400">BSC Testnet</div>
                <div className="text-xs text-gray-500 mt-2">Simulation Mode</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div>© 2025 Trustfy. All rights reserved.</div>
            <div className="flex gap-4">
              <span>Demo Platform</span>
              <span>•</span>
              <span>Not for Production</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <WalletProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </WalletProvider>
  );
}