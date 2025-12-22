// components/auth/useWalletAuth.js

import { useState, useCallback, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import base44 from "@/api/base44Client";

/**
 * Wallet + Base44 Session Authentication Hook
 * 
 * Handles:
 *  - Checking if wallet matches Base44 session
 *  - Logging out and clearing session
 *  - Forcing re-authentication when wallet changes
 */

export const useWalletAuth = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const queryClient = useQueryClient();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Checks if Base44 session user matches connected wallet
   */
  const checkAuthentication = useCallback(async () => {
    if (!isConnected || !address) {
      setIsAuthenticated(false);
      return false;
    }

    try {
      const user = await base44.auth.me();

      if (user && user.email) {
        const match =
          user.email.toLowerCase() === address.toLowerCase();

        setIsAuthenticated(match);
        return match;
      }

      setIsAuthenticated(false);
      return false;
    } catch (err) {
      console.error("Auth check error:", err);
      setIsAuthenticated(false);
      return false;
    }
  }, [isConnected, address]);

  /**
   * Called after SignatureAuth succeeds
   * Refreshes queries and updates auth state
   */
  const authenticate = useCallback(async (onSuccess) => {
    if (!isConnected || !address) {
      setAuthError("Wallet not connected");
      return false;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const ok = await checkAuthentication();
      if (!ok) {
        throw new Error("Session mismatch");
      }

      // Refresh relevant data
      queryClient.invalidateQueries();
      setIsAuthenticated(true);

      if (onSuccess) onSuccess();
      return true;
    } catch (err) {
      console.error("Authentication error:", err);
      setAuthError(err.message || "Authentication failed");
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [isConnected, address, checkAuthentication, queryClient]);

  /**
   * Logs out user from Base44 + disconnects wallet
   */
  const logout = useCallback(async () => {
    try {
      await base44.auth.logout();
      disconnect();
      queryClient.clear();
      setIsAuthenticated(false);
      return true;
    } catch (err) {
      console.error("Logout error:", err);
      return false;
    }
  }, [disconnect, queryClient]);

  /**
   * Runs automatically when wallet changes
   */
  useEffect(() => {
    if (!isConnected) {
      setIsAuthenticated(false);
      return;
    }
    checkAuthentication();
  }, [isConnected, address, checkAuthentication]);

  return {
    isAuthenticated,
    authenticate,
    logout,
    isAuthenticating,
    authError,
    walletAddress: address,
    isWalletConnected: isConnected,
    refreshAuthState: checkAuthentication
  };
};
