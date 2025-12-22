import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, ESCROW_ABI, RPC_URLS } from './contractABI';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, AlertTriangle, ExternalLink } from "lucide-react";

export default function ContractDeploymentChecker() {
  const [status, setStatus] = useState('checking');
  const [contractInfo, setContractInfo] = useState(null);

  useEffect(() => {
    checkContract();
  }, []);

  const checkContract = async () => {
    setStatus('checking');
    
    try {
      const escrowAddress = CONTRACT_ADDRESSES.BSC.escrow;
      
      if (!escrowAddress || escrowAddress === '0x0000000000000000000000000000000000000000') {
        setStatus('not_deployed');
        return;
      }

      const provider = new ethers.JsonRpcProvider(RPC_URLS.BSC);
      const code = await provider.getCode(escrowAddress);

      if (code === '0x') {
        setStatus('invalid');
        setContractInfo({ error: 'No contract found at this address' });
        return;
      }

      // Contract exists, try to read from it
      const contract = new ethers.Contract(escrowAddress, ESCROW_ABI, provider);
      
      try {
        // Try calling a view function to verify ABI matches
        await contract.platformFeeBalance?.();
        setStatus('deployed');
        setContractInfo({ 
          address: escrowAddress,
          codeSize: code.length,
          verified: true
        });
      } catch {
        setStatus('deployed');
        setContractInfo({ 
          address: escrowAddress,
          codeSize: code.length,
          verified: false,
          warning: 'Contract found but ABI may not match'
        });
      }

    } catch (error) {
      console.error('Contract check error:', error);
      setStatus('error');
      setContractInfo({ error: error.message });
    }
  };

  return (
    <div className="space-y-3">
      {status === 'checking' && (
        <div className="flex items-center gap-2 text-blue-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Checking smart contract...</span>
        </div>
      )}

      {status === 'deployed' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Smart contract is live</span>
          </div>
          {contractInfo?.warning && (
            <div className="flex items-start gap-2 text-amber-400 text-xs">
              <AlertTriangle className="w-3 h-3 mt-0.5" />
              <span>{contractInfo.warning}</span>
            </div>
          )}
        </div>
      )}

      {status === 'not_deployed' && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-2 text-amber-400 text-sm mb-2">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <span>Contract not deployed yet</span>
          </div>
          <p className="text-xs text-slate-400">
            Platform is running in demo mode. Deploy TrustfyEscrow.sol to enable on-chain escrow.
          </p>
        </div>
      )}

      {status === 'invalid' && (
        <div className="flex items-start gap-2 text-red-400 text-sm">
          <XCircle className="w-4 h-4 mt-0.5" />
          <div>
            <p>Contract address invalid</p>
            <p className="text-xs text-slate-500">{contractInfo?.error}</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-2 text-red-400 text-sm">
          <XCircle className="w-4 h-4 mt-0.5" />
          <div>
            <p>Failed to verify contract</p>
            <p className="text-xs text-slate-500">{contractInfo?.error}</p>
          </div>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={checkContract}
        className="text-slate-400 hover:text-white text-xs"
      >
        Recheck Status
      </Button>
    </div>
  );
}