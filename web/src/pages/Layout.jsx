
import React, { useState, useEffect, Suspense } from 'react';
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ADMIN_WALLETS, ARBITRATOR_WALLETS } from "@/lib/config";
import { useWallet } from "../components/web3/WalletContext";
import { TooltipProvider } from "@/components/ui/tooltip";
const Web3ProviderLazy = React.lazy(() => import("../components/web3/Web3Provider"));
const WalletProviderLazy = React.lazy(() =>
  import("../components/web3/WalletContext").then((m) => ({ default: m.WalletProvider }))
);
const NetworkGuardV2Lazy = React.lazy(() => import("../components/web3/NetworkGuardV2"));
const LayoutShellLazy = React.lazy(() => import("./LayoutShell"));
import GlobalErrorBoundary from "@/components/common/GlobalErrorBoundary";
import NetworkStatus from "@/components/common/NetworkStatus";

export default function Layout({ children, currentPageName }) {
  const isPublicPage = currentPageName === 'Home' || currentPageName === 'Safety' || currentPageName === 'Docs' || currentPageName === 'MigrationRunner';
  return (
    <GlobalErrorBoundary>
      <TooltipProvider>
        {isPublicPage ? (
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            {children}
          </Suspense>
        ) : (
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <Web3ProviderLazy>
              <WalletProviderLazy>
                <NetworkGuardV2Lazy>
                  <NetworkStatus />
                  <LayoutContent currentPageName={currentPageName}>{children}</LayoutContent>
                </NetworkGuardV2Lazy>
              </WalletProviderLazy>
            </Web3ProviderLazy>
          </Suspense>
        )}
      </TooltipProvider>
    </GlobalErrorBoundary>
  );
}

function LayoutContent({ children, currentPageName }) {
  const navigate = useNavigate();
  const { account, disconnectWallet } = useWallet();
  const accountLower = account?.toLowerCase();
  const isAllowlistedAdmin = accountLower ? ADMIN_WALLETS.has(accountLower) : false;
  const isAllowlistedArbitrator = accountLower ? ARBITRATOR_WALLETS.has(accountLower) : false;
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!accountLower) {
        return;
      }
      try {
        const profiles = await base44.entities.UserProfile.filter({ wallet_address: accountLower });
        if (profiles && profiles.length > 0) {
          return;
        }
      } catch (error) {
        return;
      }
    };
    fetchProfile();
  }, [accountLower]);
  
  const handleLogout = async () => {
    try {
      await base44.auth.logout();
    } finally {
      disconnectWallet();
      navigate(createPageUrl('Home'));
    }
  };
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading shell...</div>}>
      <LayoutShellLazy currentPageName={currentPageName}>{children}</LayoutShellLazy>
    </Suspense>
  );
}
