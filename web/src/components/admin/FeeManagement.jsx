import React, { useState } from 'react';
import { adminApi } from "@/api/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DollarSign,
  TrendingUp,
  Download,
  Wallet,
  CheckCircle,
  Info,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FeeManagement() {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawToken, setWithdrawToken] = useState('');
  
  const { data: pools = [] } = useQuery({
    queryKey: ['admin-pools'],
    queryFn: () => adminApi.listPools()
  });
  
  // Calculate collected fees from pools
  const feesByToken = pools.reduce((acc, pool) => {
    acc[pool.tokenKey] = parseFloat(pool.feeAmount) || 0;
    return acc;
  }, {});
  
  const totalFeesUSD = Object.entries(feesByToken).reduce((sum, [token, amount]) => {
    // Simplified: assume 1:1 for stablecoins, would need price oracle in production
    // This is just a rough estimate for display
    const priceMap = { 
      'USDT': 1, 'USDC': 1, 'DAI': 1,
      '0x...': 1 // Add known token addresses if needed
    };
    // Try to match symbol or address
    const price = priceMap[token] || 1; 
    return sum + (amount * price);
  }, 0);
  
  // Calculate potential dispute bond forfeitures (sellerBond + buyerBond in RESOLVED state)
  const bondForfeitures = pools.reduce((sum, pool) => {
    return sum + (parseFloat(pool.sellerBond) || 0) + (parseFloat(pool.buyerBond) || 0);
  }, 0);

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
              <p className="text-2xl font-bold text-white">~${totalFeesUSD.toLocaleString()}</p>
              <p className="text-slate-500 text-xs">Accumulated Fees</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Active Pools</p>
              <p className="text-2xl font-bold text-white">{pools.length}</p>
              <p className="text-slate-500 text-xs">Token Pools</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Wallet className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Bond Treasury</p>
              <p className="text-2xl font-bold text-white">~${bondForfeitures.toLocaleString()}</p>
              <p className="text-slate-500 text-xs">Held in contracts</p>
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
              <p className="text-slate-400 text-sm mb-1 truncate" title={token}>{token}</p>
              <p className="text-xl font-bold text-white">{amount.toLocaleString()}</p>
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
            <strong>Note:</strong> This shows aggregated revenue from resolved escrows in the database. 
            For on-chain revenue withdrawals, use the <strong>Platform Withdrawal</strong> section below.
          </AlertDescription>
        </Alert>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Download className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Database Revenue Tracker</h3>
            <p className="text-slate-400 text-sm">Aggregated revenue from database records</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Token Pool</Label>
              <select
                value={withdrawToken}
                onChange={(e) => setWithdrawToken(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="">Select Token</option>
                {Object.keys(feesByToken).map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label className="text-slate-300">Tracked Balance</Label>
              <div className="mt-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white font-mono">
                {withdrawToken ? (feesByToken[withdrawToken] || 0).toFixed(4) : '0.0000'}
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
    </div>
  );
}
