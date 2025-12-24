import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { referralsApi } from "@/api/referrals";
import { useAuth } from '@/components/web3/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Copy, Wallet, Users, Award, DollarSign, Plus, ArrowRight } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import QueryErrorHandler from "@/components/common/QueryErrorHandler";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Referrals() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const { data: dashboard, isLoading, error, refetch } = useQuery({
    queryKey: ['referrals-dashboard'],
    queryFn: referralsApi.getDashboard,
    retry: 1
  });

  const createCodeMutation = useMutation({
    mutationFn: referralsApi.createCode,
    onSuccess: () => {
      queryClient.invalidateQueries(['referrals-dashboard']);
      toast({
        title: "Code Created",
        description: "Your new referral code is ready to share.",
      });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create referral code.",
      });
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: referralsApi.withdraw,
    onSuccess: () => {
      queryClient.invalidateQueries(['referrals-dashboard']);
      setWithdrawModalOpen(false);
      setWithdrawAmount("");
      toast({
        title: "Withdrawal Successful",
        description: "Funds have been transferred to your wallet.",
      });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Withdrawal Failed",
        description: err.response?.data?.message || "Something went wrong.",
      });
    }
  });

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard.",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-slate-400">Please connect your wallet to view referrals.</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner fullScreen text="Loading referral data..." />;
  if (error) return <QueryErrorHandler error={error} retry={refetch} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Referrals & Rewards</h1>
            <p className="text-slate-400 mt-1">Invite friends and earn commissions on their trading fees.</p>
          </div>
          
          {dashboard.codes.length === 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => createCodeMutation.mutate()} 
                  disabled={createCodeMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createCodeMutation.isPending ? "Creating..." : "Generate Referral Code"}
                  <Plus className="w-4 h-4 ml-2" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                <p>Create your unique referral link to start earning</p>
              </TooltipContent>
            </Tooltip>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Referrals" 
            value={dashboard.totalReferrals} 
            icon={Users} 
            color="text-blue-400" 
            bg="bg-blue-500/10" 
            border="border-blue-500/20"
          />
          <StatsCard 
            title="Qualified Referrals" 
            value={dashboard.qualifiedReferrals} 
            icon={Award} 
            color="text-purple-400" 
            bg="bg-purple-500/10" 
            border="border-purple-500/20"
          />
          <StatsCard 
            title="Total Earnings" 
            value={`$${dashboard.earnings.toFixed(2)}`} 
            icon={DollarSign} 
            color="text-emerald-400" 
            bg="bg-emerald-500/10" 
            border="border-emerald-500/20"
          />
          <StatsCard 
            title="Wallet Balance" 
            value={`$${dashboard.walletBalance.toFixed(2)}`} 
            icon={Wallet} 
            color="text-amber-400" 
            bg="bg-amber-500/10" 
            border="border-amber-500/20"
            action={
              <Dialog open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen}>
                <DialogTrigger asChild>
                  <div className="inline-block"> {/* Tooltip needs a wrapper if DialogTrigger passes refs weirdly, but usually fine. Using div to be safe or just trigger directly. */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs border-amber-500/30 hover:bg-amber-500/20 text-amber-300">
                          Withdraw
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                        <p>Transfer earnings to your main wallet</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 text-white">
                  <DialogHeader>
                    <DialogTitle>Withdraw Earnings</DialogTitle>
                    <CardDescription>Transfer your referral earnings to your main wallet.</CardDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Amount (Max: ${dashboard.walletBalance})</label>
                      <Input 
                        type="number" 
                        value={withdrawAmount} 
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setWithdrawModalOpen(false)} className="border-slate-700 text-slate-300">Cancel</Button>
                    <Button 
                      onClick={() => withdrawMutation.mutate({ amount: parseFloat(withdrawAmount) })}
                      disabled={!withdrawAmount || parseFloat(withdrawAmount) > dashboard.walletBalance || withdrawMutation.isPending}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      {withdrawMutation.isPending ? "Processing..." : "Confirm Withdrawal"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            }
          />
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="codes" className="w-full">
          <TabsList className="bg-slate-900 border border-slate-800 p-1">
            <TabsTrigger value="codes" className="data-[state=active]:bg-slate-800 text-slate-400 data-[state=active]:text-white">My Codes</TabsTrigger>
            <TabsTrigger value="referrals" className="data-[state=active]:bg-slate-800 text-slate-400 data-[state=active]:text-white">Referrals List</TabsTrigger>
          </TabsList>
          
          <TabsContent value="codes" className="mt-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Referral Codes</CardTitle>
                <CardDescription className="text-slate-400">Share these codes or links to invite users.</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboard.codes.length > 0 ? (
                  <div className="space-y-4">
                    {dashboard.codes.map((code) => (
                      <div key={code.code} className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700 gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <span className="font-mono font-bold text-blue-400">{code.code}</span>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Referral Link</p>
                            <p className="text-white font-medium truncate max-w-xs md:max-w-md">{code.link}</p>
                          </div>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleCopyLink(code.link)} className="border-slate-600 hover:bg-slate-700 text-slate-300">
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Link
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                            <p>Copy referral link to clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-500 mb-4">You haven't generated any referral codes yet.</p>
                    <Button onClick={() => createCodeMutation.mutate()} className="bg-blue-600 hover:bg-blue-700">
                      Generate First Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="referrals" className="mt-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Referral History</CardTitle>
                <CardDescription className="text-slate-400">Users who joined using your link.</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboard.referrals.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:bg-slate-800/50">
                        <TableHead className="text-slate-400">User</TableHead>
                        <TableHead className="text-slate-400">Joined Date</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="text-slate-400 text-right">Qualified At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboard.referrals.map((ref, idx) => (
                        <TableRow key={idx} className="border-slate-800 hover:bg-slate-800/50">
                          <TableCell className="font-mono text-slate-300">
                            {ref.referee.slice(0, 6)}...{ref.referee.slice(-4)}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {new Date(ref.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {ref.qualified ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Qualified</Badge>
                            ) : (
                              <Badge variant="outline" className="border-slate-600 text-slate-500">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-slate-300">
                            {ref.qualifiedAt ? new Date(ref.qualifiedAt).toLocaleDateString() : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    No referrals yet. Share your code to get started!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color, bg, border, action }) {
  return (
    <Card className={`bg-slate-900 border-slate-800`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${bg} ${border} border`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          {action}
        </div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
