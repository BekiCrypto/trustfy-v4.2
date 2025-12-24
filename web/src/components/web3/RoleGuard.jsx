import React from 'react';
import { useWallet } from './WalletContext';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";
import { ADMIN_WALLETS, ARBITRATOR_WALLETS } from "@/lib/config";

export default function RoleGuard({ children, requiredRole, fallback = null }) {
  const { account } = useWallet();
  const addr = account?.toLowerCase();

  const hasRole =
    requiredRole === 'DEFAULT_ADMIN_ROLE'
      ? !!addr && ADMIN_WALLETS.has(addr)
      : requiredRole === 'ARBITRATOR_ROLE'
      ? !!addr && ARBITRATOR_WALLETS.has(addr)
      : !!addr;

  if (!hasRole) {
    return fallback || (
      <Alert className="bg-red-500/10 border-red-500/30">
        <Shield className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-red-300">
          You do not have the required role ({requiredRole}) to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
