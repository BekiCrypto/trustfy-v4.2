import React, { useState, useEffect } from 'react';
import { useWallet } from './WalletContext';
import { ethers } from 'ethers';
import { ESCROW_ABI, CONTRACT_ADDRESSES } from './contractABI';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

// Role hashes from contract
const ROLES = {
  DEFAULT_ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
  ARBITRATOR_ROLE: ethers.keccak256(ethers.toUtf8Bytes('ARBITRATOR_ROLE'))
};

export default function RoleGuard({ children, requiredRole, fallback = null }) {
  const { provider, account } = useWallet();
  const [hasRole, setHasRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!provider || !account) {
        setHasRole(false);
        setLoading(false);
        return;
      }

      try {
        const escrowAddress = CONTRACT_ADDRESSES.BSC.escrow;
        const contract = new ethers.Contract(escrowAddress, ESCROW_ABI, provider);
        
        const roleHash = ROLES[requiredRole] || requiredRole;
        const result = await contract.hasRole(roleHash, account);
        setHasRole(result);
      } catch (error) {
        console.error('Error checking role:', error);
        setHasRole(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [provider, account, requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

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

export { ROLES };