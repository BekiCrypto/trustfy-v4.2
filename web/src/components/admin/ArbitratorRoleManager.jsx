import { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useWallet } from "../web3/WalletContext";
import { useQuery } from "@tanstack/react-query";
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
import { Scale, UserPlus, UserMinus, Loader2, Shield, Users, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EXPLORERS, ESCROW_ABI, CONTRACT_ADDRESSES } from "../web3/contractABI";
import RoleGuard from "../web3/RoleGuard";
import WalletAddress from "../common/WalletAddress";
import ReputationBadge from "../common/ReputationBadge";
import { ethers } from 'ethers';

export default function ArbitratorRoleManager({ chain = 'BSC' }) {
  const { account, signer } = useWallet();
  const [arbitratorAddress, setArbitratorAddress] = useState('');
  const [action, setAction] = useState(null); // 'grant' or 'revoke'
  const [activeTab, setActiveTab] = useState('grant');

  const ARBITRATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes('ARBITRATOR_ROLE'));

  // Fetch arbitrators from UserProfile
  const { data: arbitrators = [] } = useQuery({
    queryKey: ['arbitrators'],
    queryFn: async () => {
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ 
        platform_role: 'arbitrator' 
      });
      return profiles;
    }
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ['all-disputes'],
    queryFn: () => base44.entities.Dispute.list()
  });

  // Calculate arbitrator stats
  const arbitratorStats = arbitrators.map(arb => {
    const arbDisputes = disputes.filter(d => d.arbitrator_address === arb.wallet_address);
    const resolved = arbDisputes.filter(d => d.status === 'resolved');
    const pending = arbDisputes.filter(d => d.status === 'arbitration');
    
    const avgResolutionTime = resolved.length > 0
      ? resolved.reduce((sum, d) => {
          const start = new Date(d.created_date).getTime();
          const end = new Date(d.resolved_at).getTime();
          return sum + (end - start);
        }, 0) / (resolved.length * 1000 * 60 * 60)
      : 0;

    return {
      ...arb,
      totalDisputes: arbDisputes.length,
      resolvedDisputes: resolved.length,
      pendingDisputes: pending.length,
      avgResolutionTime: avgResolutionTime.toFixed(1)
    };
  });

  const handleGrantRole = async () => {
    if (!ethers.isAddress(arbitratorAddress)) {
      toast.error('Invalid wallet address');
      return;
    }

    setAction('grant');
    try {
      const escrowAddress = CONTRACT_ADDRESSES[chain].escrow;
      const contract = new ethers.Contract(escrowAddress, ESCROW_ABI, signer);
      
      const tx = await contract.grantRole(ARBITRATOR_ROLE, arbitratorAddress);
      
      toast.info('Granting arbitrator role...');
      const receipt = await tx.wait();
      
      toast.success('Arbitrator role granted!', {
        description: `${arbitratorAddress.slice(0, 10)}... is now an arbitrator`,
        action: {
          label: 'View TX',
          onClick: () => window.open(`${EXPLORERS[chain]}/tx/${receipt.hash}`, '_blank')
        }
      });
      
      setArbitratorAddress('');
    } catch (error) {
      console.error('Error granting role:', error);
      toast.error(error.message || 'Failed to grant arbitrator role');
    } finally {
      setAction(null);
    }
  };

  const handleRevokeRole = async () => {
    if (!ethers.isAddress(arbitratorAddress)) {
      toast.error('Invalid wallet address');
      return;
    }

    if (!confirm(`Revoke arbitrator role from ${arbitratorAddress}?`)) return;

    setAction('revoke');
    try {
      const escrowAddress = CONTRACT_ADDRESSES[chain].escrow;
      const contract = new ethers.Contract(escrowAddress, ESCROW_ABI, signer);
      
      const tx = await contract.revokeRole(ARBITRATOR_ROLE, arbitratorAddress);
      
      toast.info('Revoking arbitrator role...');
      const receipt = await tx.wait();
      
      toast.success('Arbitrator role revoked!', {
        description: `${arbitratorAddress.slice(0, 10)}... is no longer an arbitrator`,
        action: {
          label: 'View TX',
          onClick: () => window.open(`${EXPLORERS[chain]}/tx/${receipt.hash}`, '_blank')
        }
      });
      
      setArbitratorAddress('');
    } catch (error) {
      console.error('Error revoking role:', error);
      toast.error(error.message || 'Failed to revoke arbitrator role');
    } finally {
      setAction(null);
    }
  };

  return (
    <RoleGuard requiredRole="DEFAULT_ADMIN_ROLE">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-700/50 p-4">
            <p className="text-slate-400 text-xs mb-1">Total Arbitrators</p>
            <p className="text-white text-2xl font-bold">{arbitrators.length}</p>
          </Card>
          <Card className="bg-purple-500/10 border-purple-500/30 p-4">
            <p className="text-purple-400 text-xs mb-1">Active Cases</p>
            <p className="text-white text-2xl font-bold">
              {arbitrators.reduce((sum, a) => sum + (arbitratorStats.find(s => s.id === a.id)?.pendingDisputes || 0), 0)}
            </p>
          </Card>
          <Card className="bg-emerald-500/10 border-emerald-500/30 p-4">
            <p className="text-emerald-400 text-xs mb-1">Total Resolved</p>
            <p className="text-white text-2xl font-bold">
              {arbitrators.reduce((sum, a) => sum + (arbitratorStats.find(s => s.id === a.id)?.resolvedDisputes || 0), 0)}
            </p>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500/30 p-4">
            <p className="text-blue-400 text-xs mb-1">Avg Resolution</p>
            <p className="text-white text-2xl font-bold">
              {arbitratorStats.length > 0 
                ? (arbitratorStats.reduce((sum, s) => sum + parseFloat(s.avgResolutionTime), 0) / arbitratorStats.length).toFixed(1)
                : 0}h
            </p>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-900/50 border border-slate-700/50">
            <TabsTrigger value="grant">Grant/Revoke Role</TabsTrigger>
            <TabsTrigger value="list">Active Arbitrators ({arbitrators.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="grant">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Scale className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Arbitrator Role Management</h3>
                  <p className="text-slate-400 text-xs">Grant or revoke arbitrator privileges on-chain</p>
                </div>
                <Badge className="ml-auto bg-red-500/20 text-red-400 border-red-500/30">
                  Super Admin Only
                </Badge>
              </div>

              <Alert className="bg-amber-500/10 border-amber-500/30 mb-6">
                <Shield className="h-4 w-4 text-amber-400" />
                <AlertDescription className="text-amber-300 text-xs">
                  <strong>ARBITRATOR_ROLE</strong> allows users to resolve disputes on-chain. 
                  Grant this role only to trusted, verified arbitrators.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">
                    Wallet Address
                  </label>
                  <Input
                    value={arbitratorAddress}
                    onChange={(e) => setArbitratorAddress(e.target.value)}
                    placeholder="0x..."
                    className="bg-slate-800 border-slate-700 text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleGrantRole}
                    disabled={action !== null || !account || !arbitratorAddress}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                  >
                    {action === 'grant' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Granting...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Grant Role
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleRevokeRole}
                    disabled={action !== null || !account || !arbitratorAddress}
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    {action === 'revoke' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Revoking...
                      </>
                    ) : (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Revoke Role
                      </>
                    )}
                  </Button>
                </div>

                {!account && (
                  <Alert className="bg-red-500/10 border-red-500/30">
                    <Shield className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300 text-xs">
                      Connect your admin wallet to manage arbitrator roles
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </Card>
          </TabsContent>

        <TabsContent value="list">
          <Card className="bg-slate-900/50 border-slate-700/50 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Active Arbitrators</h3>
              
              {arbitrators.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No arbitrators assigned yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700 hover:bg-slate-800/50">
                        <TableHead className="text-slate-300">Arbitrator</TableHead>
                        <TableHead className="text-slate-300">Wallet</TableHead>
                        <TableHead className="text-slate-300">Reputation</TableHead>
                        <TableHead className="text-slate-300">Cases</TableHead>
                        <TableHead className="text-slate-300">Resolved</TableHead>
                        <TableHead className="text-slate-300">Pending</TableHead>
                        <TableHead className="text-slate-300">Avg Time</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {arbitratorStats.map((arb) => (
                        <TableRow key={arb.id} className="border-slate-700 hover:bg-slate-800/30">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                                {(arb.display_name || 'A').charAt(0).toUpperCase()}
                              </div>
                              <span className="text-white font-medium">{arb.display_name || 'Anonymous'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <WalletAddress address={arb.wallet_address} short />
                          </TableCell>
                          <TableCell>
                            <ReputationBadge profile={arb} size="sm" />
                          </TableCell>
                          <TableCell>
                            <span className="text-white font-medium">{arb.totalDisputes}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-medium">{arb.resolvedDisputes}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                              {arb.pendingDisputes}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-300">{arb.avgResolutionTime}h</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setArbitratorAddress(arb.wallet_address);
                                  setActiveTab('grant');
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <UserMinus className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
