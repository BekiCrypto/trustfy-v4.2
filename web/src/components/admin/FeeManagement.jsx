import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign,
  TrendingUp,
  Download,
  Wallet,
  ArrowUpRight,
  Loader2,
  CheckCircle,
  Info,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FeeManagement() {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawToken, setWithdrawToken] = useState('USDT');
  const queryClient = useQueryClient();
  
  const { data: trades = [] } = useQuery({
    queryKey: ['all-trades'],
    queryFn: () => base44.entities.Trade.list()
  });
  
  // Calculate collected fees
  const completedTrades = trades.filter(t => t.status === 'completed');
  
  const feesByToken = completedTrades.reduce((acc, trade) => {
    const token = trade.token_symbol;
    const makerFee = (trade.amount * (trade.maker_fee / 100)) || 0;
    const takerFee = (trade.amount * (trade.taker_fee / 100)) || 0;
    const totalFee = makerFee + takerFee;
    
    acc[token] = (acc[token] || 0) + totalFee;
    return acc;
  }, {});
  
  const totalFeesUSD = Object.entries(feesByToken).reduce((sum, [token, amount]) => {
    // Simplified: assume 1:1 for stablecoins, would need price oracle in production
    const priceMap = { USDT: 1, USDC: 1, BTC: 45000, ETH: 2500, BNB: 300, MATIC: 0.8 };
    return sum + (amount * (priceMap[token] || 1));
  }, 0);
  
  const disputeFees = trades
    .filter(t => t.status === 'disputed')
    .reduce((sum, t) => sum + ((t.amount * (t.dispute_fee || 1) / 100) || 0), 0);
  
  const withdrawFees = useMutation({
    mutationFn: async ({ token, amount }) => {
      // In production, this would interact with smart contract
      // For now, we'll just simulate the withdrawal
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ 
            success: true, 
            txHash: `0x${Math.random().toString(16).slice(2, 18)}...`,
            amount,
            token
          });
        }, 2000);
      });
    },
    onSuccess: (data) => {
      toast.success(`Withdrawn ${data.amount} ${data.token}`, {
        description: `Tx: ${data.txHash}`
      });
      setWithdrawAmount('');
    },
    onError: () => {
      toast.error('Failed to withdraw revenue');
    }
  });
  
  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    const available = feesByToken[withdrawToken] || 0;
    if (amount > available) {
      toast.error('Insufficient balance available');
      return;
    }
    
    withdrawFees.mutate({ token: withdrawToken, amount });
  };
  
  return (
    <div className="space-y-6 max-w-6xl">
      {/* On-chain Notice */}
      <Alert className="bg-purple-500/10 border-purple-500/30">
        <Shield className="h-4 w-4 text-purple-400" />
        <AlertDescription className="text-purple-300 text-sm">
          <strong>On-chain Revenue Management:</strong> Platform revenue is collected in the escrow contract treasury. 
          Use the Platform Withdrawal section below to withdraw on-chain revenue and bond proceeds.
        </AlertDescription>
      </Alert>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Platform Revenue</p>
              <p className="text-2xl font-bold text-white">${totalFeesUSD.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Escrow Volume</p>
              <p className="text-2xl font-bold text-white">{completedTrades.length}</p>
              <p className="text-slate-500 text-xs">completed escrows</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Wallet className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">DisputeBond Forfeitures (Treasury)</p>
              <p className="text-2xl font-bold text-white">${disputeFees.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Revenue by Token */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Available Revenue by Token</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(feesByToken).map(([token, amount]) => (
            <div key={token} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <p className="text-slate-400 text-sm mb-1">{token}</p>
              <p className="text-xl font-bold text-white">{amount.toFixed(4)}</p>
            </div>
          ))}
          {Object.keys(feesByToken).length === 0 && (
            <div className="col-span-3 text-center py-8 text-slate-500">
              No revenue collected yet
            </div>
          )}
        </div>
      </Card>
      
      {/* Database Revenue Tracking (Legacy - For Reference) */}
      <Card className="bg-slate-900/50 border-amber-500/30 p-6">
        <Alert className="bg-amber-500/10 border-amber-500/30 mb-4">
          <Info className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-300 text-xs">
            <strong>Note:</strong> This shows estimated revenue from completed escrows in the database. 
            For on-chain revenue withdrawals, use the <strong>Platform Withdrawal</strong> section below.
          </AlertDescription>
        </Alert>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Download className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Database Revenue Tracker</h3>
            <p className="text-slate-400 text-sm">Estimated revenue from completed escrows (reference only)</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Token</Label>
              <select
                value={withdrawToken}
                onChange={(e) => setWithdrawToken(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                disabled
              >
                {Object.keys(feesByToken).map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label className="text-slate-300">Estimated Available Balance</Label>
              <div className="mt-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white font-mono">
                {(feesByToken[withdrawToken] || 0).toFixed(4)} {withdrawToken}
              </div>
            </div>
          </div>
          
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300 text-xs">
              Use <strong>Platform Withdrawal</strong> below to withdraw on-chain revenue and bond proceeds from the smart contract.
            </AlertDescription>
          </Alert>
        </div>
      </Card>
      
      {/* Recent Revenue Updates */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Revenue Updates</h3>
        <div className="space-y-2">
          {completedTrades.slice(0, 10).map((trade) => {
            const makerFee = (trade.amount * (trade.maker_fee / 100)) || 0;
            const takerFee = (trade.amount * (trade.taker_fee / 100)) || 0;
            const totalFee = makerFee + takerFee;
            
            return (
              <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Escrow #{trade.trade_id?.slice(-8)}</p>
                    <p className="text-slate-500 text-xs">{format(new Date(trade.created_date), 'MMM d, yyyy HH:mm')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-semibold">+{totalFee.toFixed(4)} {trade.token_symbol}</p>
                  <p className="text-slate-500 text-xs">Revenue recorded</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
