import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { hasPageAccess } from "./AccessControl";
import { ADMIN_WALLETS, ARBITRATOR_WALLETS } from "@/lib/config";
import { useWallet } from "@/components/web3/WalletContext";
import { useAccount } from "wagmi";

export default function ProtectedPage({ children, requiredRoles, pageName }) {
  const { address: wagmiAddress } = useAccount();
  const { account } = useWallet();
  const walletAddress = (wagmiAddress || account)?.toLowerCase();
  const isAllowlistedAdmin = walletAddress ? ADMIN_WALLETS.has(walletAddress) : false;
  const isAllowlistedArbitrator = walletAddress ? ARBITRATOR_WALLETS.has(walletAddress) : false;
  
  const allowlistedRole = isAllowlistedAdmin
    ? 'admin'
    : isAllowlistedArbitrator
    ? 'arbitrator'
    : 'user';
  const userRole = allowlistedRole;
  const hasAccess = pageName 
    ? hasPageAccess(userRole, pageName)
    : requiredRoles?.includes(userRole);
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
        <Card className="bg-slate-900 border-slate-700 p-12 text-center max-w-md">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-6">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Required role: {requiredRoles?.join(' or ') || 'Higher access level'}
            <br />
            Your role: {userRole}
          </p>
          <Link to={createPageUrl('Marketplace')}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Marketplace
            </Button>
          </Link>
        </Card>
      </div>
    );
  }
  
  return children;
}
