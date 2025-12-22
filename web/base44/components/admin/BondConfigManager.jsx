import React, { useState } from 'react';
import { useWallet } from "../web3/WalletContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Settings, Loader2, Save, ExternalLink, Info } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EXPLORERS, ESCROW_ABI, CONTRACT_ADDRESSES } from "../web3/contractABI";
import RoleGuard from "../web3/RoleGuard";
import { ethers } from 'ethers';

export default function BondConfigManager({ chain = 'BSC' }) {
  const { account, provider, signer } = useWallet();
  const [bondBps, setBondBps] = useState('1000'); // 10% default
  const [minBond, setMinBond] = useState('10'); // 10 tokens default
  const [saving, setSaving] = useState(false);
  const [thresholds, setThresholds] = useState({
    USDT: '50',
    USDC: '50',
    BNB: '1'
  });
  const [updatingThreshold, setUpdatingThreshold] = useState(null);

  const handleSetBondConfig = async () => {
    if (!signer) {
      toast.error('Wallet not connected');
      return;
    }

    const bps = parseInt(bondBps);
    const minBondValue = parseFloat(minBond);

    if (bps < 100 || bps > 5000) {
      toast.error('Bond percentage must be between 1% (100 bps) and 50% (5000 bps)');
      return;
    }

    if (minBondValue <= 0) {
      toast.error('Minimum bond must be greater than 0');
      return;
    }

    setSaving(true);
    try {
      const escrowAddress = CONTRACT_ADDRESSES[chain].escrow;
      const contract = new ethers.Contract(escrowAddress, ESCROW_ABI, signer);

      const minBondWei = ethers.parseUnits(minBond, 18);
      const tx = await contract.setBondConfig(bps, minBondWei);
      
      toast.info('Transaction submitted, waiting for confirmation...');
      const receipt = await tx.wait();
      
      toast.success('Bond configuration updated!', {
        description: `${bps / 100}% bond rate, min ${minBond} tokens`,
        action: {
          label: 'View TX',
          onClick: () => window.open(`${EXPLORERS[chain]}/tx/${receipt.hash}`, '_blank')
        }
      });
    } catch (error) {
      console.error('Error setting bond config:', error);
      toast.error(error.message || 'Failed to update bond config');
    } finally {
      setSaving(false);
    }
  };

  const handleSetThreshold = async (token) => {
    if (!signer) {
      toast.error('Wallet not connected');
      return;
    }

    const thresholdValue = parseFloat(thresholds[token]);
    if (thresholdValue <= 0) {
      toast.error('Threshold must be greater than 0');
      return;
    }

    setUpdatingThreshold(token);
    try {
      const escrowAddress = CONTRACT_ADDRESSES[chain].escrow;
      const tokenAddress = CONTRACT_ADDRESSES[chain][token];
      
      if (!tokenAddress) {
        toast.error('Token not supported');
        return;
      }

      const contract = new ethers.Contract(escrowAddress, ESCROW_ABI, signer);
      const thresholdWei = ethers.parseUnits(thresholds[token], 18);
      
      const tx = await contract.setBondWithdrawalThreshold(tokenAddress, thresholdWei);
      
      toast.info('Transaction submitted...');
      const receipt = await tx.wait();
      
      toast.success(`${token} withdrawal threshold updated!`, {
        description: `Min withdrawal: ${thresholds[token]} ${token}`,
        action: {
          label: 'View TX',
          onClick: () => window.open(`${EXPLORERS[chain]}/tx/${receipt.hash}`, '_blank')
        }
      });
    } catch (error) {
      console.error('Error setting threshold:', error);
      toast.error(error.message || 'Failed to update threshold');
    } finally {
      setUpdatingThreshold(null);
    }
  };

  return (
    <RoleGuard requiredRole="DEFAULT_ADMIN_ROLE">
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Settings className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Bond System Configuration</h3>
            <p className="text-slate-400 text-xs">V3 on-chain bond parameters</p>
          </div>
          <Badge className="ml-auto bg-purple-500/20 text-purple-400 border-purple-500/30">
            Admin Only
          </Badge>
        </div>

        <Alert className="bg-amber-500/10 border-amber-500/30 mb-6">
          <Shield className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-300 text-xs">
            <strong>⚠️ Critical:</strong> Changes affect all future trades system-wide. 
            Verify parameters carefully before submitting blockchain transactions.
          </AlertDescription>
        </Alert>

        {/* Global Bond Config */}
        <div className="space-y-4 mb-8">
          <h4 className="text-sm font-semibold text-white">Global Bond Settings</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Bond Rate (Basis Points)</Label>
              <Input
                type="number"
                value={bondBps}
                onChange={(e) => setBondBps(e.target.value)}
                placeholder="1000"
                className="bg-slate-800 border-slate-700 mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Current: {bondBps} bps = {(bondBps / 100).toFixed(1)}%
              </p>
            </div>
            
            <div>
              <Label className="text-slate-300 text-sm">Minimum Bond (tokens)</Label>
              <Input
                type="number"
                step="0.01"
                value={minBond}
                onChange={(e) => setMinBond(e.target.value)}
                placeholder="10"
                className="bg-slate-800 border-slate-700 mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Floor bond amount regardless of trade size
              </p>
            </div>
          </div>

          <Button
            onClick={handleSetBondConfig}
            disabled={saving || !account}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting to Blockchain...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Bond Config On-Chain
              </>
            )}
          </Button>
        </div>

        {/* Bond Withdrawal Thresholds */}
        <div className="pt-6 border-t border-slate-700/50 space-y-4">
          <h4 className="text-sm font-semibold text-white">Withdrawal Thresholds per Token</h4>
          
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300 text-xs">
              Set minimum amounts users must accumulate before withdrawing bond credits. 
              Prevents frequent small withdrawals that waste gas fees.
            </AlertDescription>
          </Alert>

          {Object.entries(thresholds).map(([token, value]) => (
            <div key={token} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-slate-300 text-sm">{token} Minimum</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={(e) => setThresholds(prev => ({ ...prev, [token]: e.target.value }))}
                    placeholder="50"
                    className="bg-slate-900 border-slate-700 mt-1"
                  />
                </div>
                <Button
                  onClick={() => handleSetThreshold(token)}
                  disabled={updatingThreshold === token || !account}
                  variant="outline"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 mt-6"
                >
                  {updatingThreshold === token ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Set
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {!account && (
          <Alert className="bg-red-500/10 border-red-500/30 mt-4">
            <Shield className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300 text-xs">
              Connect your admin wallet to modify bond configuration
            </AlertDescription>
          </Alert>
        )}
      </Card>
    </RoleGuard>
  );
}