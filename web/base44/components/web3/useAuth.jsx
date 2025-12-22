import { useState, useEffect, useCallback } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { base44 } from "@/api/base44Client";
import { toast } from 'sonner';

/**
 * Custom hook for Web3 authentication with signature verification
 * Handles the complete auth flow: connect → sign nonce → verify → session
 */
export function useAuth() {
  const { address, isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Check if user has an existing session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (user && address) {
          // Verify the authenticated user's email matches the connected wallet
          if (user.email.toLowerCase() === address.toLowerCase()) {
            setIsAuthenticated(true);
          } else {
            // Wallet changed, need to re-authenticate
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    if (address) {
      checkAuth();
    } else {
      setIsAuthenticated(false);
    }
  }, [address]);

  // Handle wallet disconnection
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      // Wallet disconnected, log out
      handleLogout();
    }
  }, [isConnected]);

  /**
   * Authenticate user with signature verification
   * Flow: Request nonce → Sign nonce → Verify signature → Create session
   */
  const authenticate = useCallback(async () => {
    if (!address) {
      toast.error('No wallet connected');
      return false;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      // Step 1: Request authentication nonce from backend
      toast.info('Generating authentication message...');
      
      const nonceResponse = await base44.functions.invoke('verifyWalletSignature', {
        action: 'generate_nonce',
        address: address.toLowerCase()
      });

      if (!nonceResponse.data.success) {
        throw new Error('Failed to generate authentication nonce');
      }

      const nonce = nonceResponse.data.nonce;

      // Step 2: Request user to sign the nonce
      toast.info('Please sign the message in your wallet to authenticate');
      
      let signature;
      try {
        signature = await signMessageAsync({ message: nonce });
      } catch (signError) {
        if (signError.message?.includes('User rejected') || signError.message?.includes('rejected')) {
          toast.error('Authentication cancelled by user');
        } else {
          toast.error('Failed to sign message');
        }
        throw signError;
      }

      // Step 3: Verify signature on backend
      toast.info('Verifying signature...');
      
      const verifyResponse = await base44.functions.invoke('verifyWalletSignature', {
        action: 'verify_signature',
        address: address.toLowerCase(),
        signature: signature,
        nonce: nonce
      });

      if (!verifyResponse.data.success) {
        throw new Error(verifyResponse.data.error || 'Signature verification failed');
      }

      // Step 4: Login with the wallet address (used as email in Base44)
      toast.info('Creating session...');
      
      // Redirect to Base44 login with wallet address as email
      const loginUrl = `/api/auth/login?email=${encodeURIComponent(address.toLowerCase())}&redirect=${encodeURIComponent(window.location.pathname)}`;
      window.location.href = loginUrl;
      
      return true;

    } catch (error) {
      console.error('Authentication error:', error);
      const errorMessage = error.message || 'Authentication failed';
      setAuthError(errorMessage);
      setIsAuthenticated(false);
      
      if (!errorMessage.includes('cancelled')) {
        toast.error(errorMessage);
      }
      
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, signMessageAsync]);

  /**
   * Handle logout - disconnect wallet and clear session
   */
  const handleLogout = useCallback(async () => {
    try {
      await base44.auth.logout();
      disconnect();
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  }, [disconnect]);

  return {
    address,
    isConnected,
    isAuthenticated,
    isAuthenticating,
    authError,
    chain,
    authenticate,
    logout: handleLogout
  };
}