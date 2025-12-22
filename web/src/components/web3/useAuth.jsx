import { useEffect, useMemo } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { toast } from 'sonner';
import { useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { session, isAuthenticating, error, logout, reauthenticate } = useAuthContext();

  const isAuthenticated = useMemo(() => {
    if (!session || !address) return false;
    return session.address.toLowerCase() === address.toLowerCase();
  }, [session, address]);

  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      void logout();
    }
  }, [isConnected, isAuthenticated, logout]);

  const authenticate = async () => {
    if (!address) {
      toast.error('No wallet connected');
      return false;
    }
    await reauthenticate();
    return true;
  };

  const handleLogout = async () => {
    await logout();
    disconnect();
    toast.success('Logged out successfully');
  };

  return {
    address,
    isConnected,
    isAuthenticated,
    isAuthenticating,
    authError: error ?? null,
    chain,
    authenticate,
    logout: handleLogout,
  };
}
