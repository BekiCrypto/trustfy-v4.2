import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, ExternalLink, Copy, Shield } from "lucide-react";
import { CONTRACT_ADDRESSES, EXPLORERS } from './contractABI';
import { toast } from 'sonner';
import ContractDeploymentChecker from './ContractDeploymentChecker';

export default function SmartContractStatus() {
  const escrowAddress = CONTRACT_ADDRESSES.BSC.escrow;
  const isDeployed = escrowAddress && escrowAddress !== '0x0000000000000000000000000000000000000000';

  const copyAddress = () => {
    navigator.clipboard.writeText(escrowAddress);
    toast.success('Contract address copied');
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${isDeployed ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
          <Shield className={`w-5 h-5 ${isDeployed ? 'text-emerald-400' : 'text-amber-400'}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">TrustfyEscrow V3 • Bond Pools</h3>
          <p className="text-slate-400 text-xs">BSC Testnet • Chain ID 97</p>
        </div>
        <Badge className={isDeployed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}>
          {isDeployed ? 'Live' : 'Not Deployed'}
        </Badge>
      </div>

      {isDeployed ? (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold">V3 Contract Live</span>
            </div>
            <p className="text-xs text-emerald-300">
              Deployed with bond credit pools, automatic reuse, and optimized gas costs
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-500 mb-1">Contract Address:</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-white truncate flex-1">{escrowAddress}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyAddress}
                className="h-6 w-6"
              >
                <Copy className="w-3 h-3" />
              </Button>
              <a
                href={`${EXPLORERS.BSC}/address/${escrowAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-xs text-blue-300 font-semibold mb-1">✨ V3 Features:</p>
            <ul className="text-xs text-slate-400 ml-4 space-y-0.5 list-disc">
              <li>Bond credit pools per asset</li>
              <li>Automatic bond reuse</li>
              <li>Pooled revenue collection</li>
              <li>Separate bond revenue tracking</li>
            </ul>
          </div>

          <ContractDeploymentChecker />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Contract deployment required</p>
              <p className="text-xs text-slate-400 mt-1">
                The escrow smart contract needs to be deployed to BSC before trades can be executed on-chain.
              </p>
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs text-amber-300 font-medium mb-2">Deployment Steps:</p>
            <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
              <li>Review TrustfyEscrow.sol smart contract</li>
              <li>Deploy to BSC using Hardhat/Remix</li>
              <li>Update contract address in contractABI.js</li>
              <li>Verify contract on BSCScan</li>
            </ol>
          </div>

          <a 
            href="/deployment-guide" 
            target="_blank"
            className="block"
          >
            <Button variant="outline" className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Deployment Guide
            </Button>
          </a>
        </div>
      )}
    </Card>
  );
}
