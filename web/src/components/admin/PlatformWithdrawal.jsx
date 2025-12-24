import { useState, useEffect } from 'react';
import { useWallet } from "../web3/WalletContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Wallet,
  TrendingUp,
  Shield,
  ArrowDownToLine,
  Loader2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EXPLORERS } from "../web3/contractABI";
import { useAdminPools, useWithdrawPlatform } from "@/hooks/admin";
import { ethers } from "ethers";
import { BEP20Helper } from "../web3/BEP20Helper";

const DEFAULT_TOKENS = ['USDT', 'USDC', 'BNB'];

export default function PlatformWithdrawal({ chain = 'BSC', tokens = DEFAULT_TOKENS }) {
  const { 
    account, 
    getPlatformFeePool, 
    getPlatformBondRevenue, 
    withdrawPlatformProceeds 
  } = useWallet();
  const withdrawMutation = useWithdrawPlatform();
  const { data: pools } = useAdminPools();
  
  const [feePools, setFeePools] = useState({});
  const [bondRevenue, setBondRevenue] = useState({});
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(null);
  const [withdrawAmounts, setWithdrawAmounts] = useState({});
  const [bondWithdrawAmounts, setBondWithdrawAmounts] = useState({});

  const fetchPlatformData = async () => {
    setLoading(true);
    const fees = {};
    const bonds = {};
    
    for (const token of tokens) {
      try {
        const tokenAddress = BEP20Helper.getTokenAddress(token, chain);
        if (!ethers.isAddress(tokenAddress)) {
          fees[token] = '0';
          bonds[token] = '0';
          continue;
        }
        const pool = Array.isArray(pools)
          ? pools.find((p) => (p.tokenKey || "").toLowerCase() === tokenAddress.toLowerCase())
          : null;
        const feeAmount = pool?.feeAmount ?? '0';
        const sellerBond = pool?.sellerBond ?? '0';
        const buyerBond = pool?.buyerBond ?? '0';
        const bondTotal = (parseFloat(sellerBond || '0') + parseFloat(buyerBond || '0')).toString();
        fees[token] = feeAmount;
        bonds[token] = bondTotal;
      } catch (error) {
        console.error(`Error fetching ${token} platform data:`, error);
        fees[token] = '0';
        bonds[token] = '0';
      }
    }
    
    setFeePools(fees);
    setBondRevenue(bonds);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlatformData();
  }, [chain, Array.isArray(tokens) ? tokens.join(",") : "", pools]);

  const handleWithdraw = async (token) => {
    const feeAmount = withdrawAmounts[token] || '0';
    const bondAmount = bondWithdrawAmounts[token] || '0';
    
    if (parseFloat(feeAmount) <= 0 && parseFloat(bondAmount) <= 0) {
      toast.error('Please enter an amount to withdraw');
      return;
    }

    const availableFees = parseFloat(feePools[token] || 0);
    const availableBonds = parseFloat(bondRevenue[token] || 0);
    
    if (parseFloat(feeAmount) > availableFees) {
      toast.error('Revenue amount exceeds available pool');
      return;
    }
    
    if (parseFloat(bondAmount) > availableBonds) {
      toast.error('Bond revenue amount exceeds available pool');
      return;
    }

    setWithdrawing(token);
    try {
      await withdrawMutation.mutateAsync({
        tokenKey: token,
        feeAmount,
        bondAmount,
      });
      toast.success('Platform withdrawal requested via backend worker', {
        description: `${feeAmount} revenue + ${bondAmount} bond revenue`,
      });

      // Refresh data
      await fetchPlatformData();
      setWithdrawAmounts(prev => ({ ...prev, [token]: '' }));
      setBondWithdrawAmounts(prev => ({ ...prev, [token]: '' }));
    } catch (error) {
      console.error('Error withdrawing platform proceeds:', error);
      toast.error(error.message || 'Failed to request platform withdrawal');
    } finally {
      setWithdrawing(null);
    }
  };

  const totalFees = Object.values(feePools).reduce((sum, val) => sum + parseFloat(val || 0), 0);
  const totalBondRevenue = Object.values(bondRevenue).reduce((sum, val) => sum + parseFloat(val || 0), 0);

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Platform Revenue Withdrawal</h3>
            <p className="text-slate-400 text-xs">On-chain treasury pools (fees + dispute forfeitures)</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPlatformData}
          disabled={loading}
          className="border-slate-600 text-slate-300"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      <Alert className="bg-blue-500/10 border-blue-500/30 mb-6">
        <Shield className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300 text-xs">
          <strong>On-chain Tracking:</strong> Platform fees and DisputeBond forfeitures are tracked separately in the contract.
          Withdraw both independently to the platform wallet.
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 text-xs">Total Revenue Pool</span>
          </div>
          <p className="text-white font-bold text-lg">{totalFees.toFixed(4)} tokens</p>
        </div>
        
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-slate-400 text-xs">Total Bond Revenue</span>
          </div>
          <p className="text-white font-bold text-lg">{totalBondRevenue.toFixed(4)} tokens</p>
        </div>
      </div>

      {/* Per Token Withdrawal */}
      <div className="space-y-4">
        {Object.keys(feePools).map((token) => {
          const feePool = parseFloat(feePools[token] || 0);
          const bondRev = parseFloat(bondRevenue[token] || 0);
          const hasRevenue = feePool > 0 || bondRev > 0;
          
          return (
            <div
              key={token}
              className={`p-4 rounded-lg border ${
                hasRevenue
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-slate-900/50 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{token}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{token} Revenue</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-emerald-400">
                        Revenue: {feePool.toFixed(6)}
                      </span>
                      <span className="text-xs text-purple-400">
                        Bonds: {bondRev.toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {hasRevenue && (
                <div className="space-y-3 pt-3 border-t border-slate-700">
                  {/* Revenue Withdrawal */}
                  {feePool > 0 && (
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Withdraw from Revenue Pool</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={withdrawAmounts[token] || ''}
                          onChange={(e) => setWithdrawAmounts(prev => ({
                            ...prev,
                            [token]: e.target.value
                          }))}
                          max={feePool}
                          step="0.0001"
                          className="bg-slate-900/50 border-slate-700 text-white"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setWithdrawAmounts(prev => ({
                            ...prev,
                            [token]: feePool.toString()
                          }))}
                          className="text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          Max
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Bond Revenue Withdrawal */}
                  {bondRev > 0 && (
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Withdraw from Bond Revenue</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={bondWithdrawAmounts[token] || ''}
                          onChange={(e) => setBondWithdrawAmounts(prev => ({
                            ...prev,
                            [token]: e.target.value
                          }))}
                          max={bondRev}
                          step="0.0001"
                          className="bg-slate-900/50 border-slate-700 text-white"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBondWithdrawAmounts(prev => ({
                            ...prev,
                            [token]: bondRev.toString()
                          }))}
                          className="text-xs text-purple-400 hover:text-purple-300"
                        >
                          Max
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => handleWithdraw(token)}
                    disabled={withdrawing === token || (!withdrawAmounts[token] && !bondWithdrawAmounts[token])}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                  >
                    {withdrawing === token ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Withdrawing...
                      </>
                    ) : (
                      <>
                        <ArrowDownToLine className="w-4 h-4 mr-2" />
                        Withdraw to Platform Wallet
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!account && (
        <Alert className="bg-amber-500/10 border-amber-500/30 mt-4">
          <Wallet className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-300 text-xs">
            Connect your admin wallet to withdraw platform proceeds
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
}
