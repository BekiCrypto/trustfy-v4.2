import React from 'react';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { TARGET_CHAIN_ID, SUPPORTED_CHAINS } from './wagmiConfig';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * Network Guard Component - Ensures user is on the correct network
 * Shows warning if on wrong network with easy switch button
 */
export default function NetworkGuardV2({ children }) {
  const { t } = useTranslation();
  // Gracefully handle missing Wagmi context
  let isConnected, chainId, switchChain, isPending;
  
  try {
    const account = useAccount();
    const chain = useChainId();
    const switchChainHook = useSwitchChain();
    
    isConnected = account.isConnected;
    chainId = chain;
    switchChain = switchChainHook.switchChain;
    isPending = switchChainHook.isPending;
  } catch (e) {
    // Not in Wagmi context, render children directly
    return <>{children}</>;
  }

  const isWrongNetwork = isConnected && chainId !== TARGET_CHAIN_ID;
  const targetChain = SUPPORTED_CHAINS[TARGET_CHAIN_ID];

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: TARGET_CHAIN_ID });
      toast.success(t('web3.networkGuardV2.toastSwitched', { network: targetChain.name }));
    } catch (error) {
      console.error('Switch network error:', error);
      if (error.message?.includes('User rejected')) {
        toast.error(t('web3.networkGuardV2.toastCancelled'));
      } else {
        toast.error(t('web3.networkGuardV2.toastFailed'));
      }
    }
  };

  if (!isWrongNetwork) {
    return children;
  }

  return (
    <>
      {/* Warning Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-500/10 border-b border-red-500/30 backdrop-blur-sm">
        <Alert className="rounded-none border-0 bg-transparent">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="flex items-center justify-between text-red-300">
            <span>
              <strong>{t('web3.networkGuardV2.bannerTitle')}</strong>{' '}
              {t('web3.networkGuardV2.bannerMessage', { network: targetChain.name })}
            </span>
            <Button
              onClick={handleSwitchNetwork}
              disabled={isPending}
              size="sm"
              className="ml-4 bg-red-500 hover:bg-red-600 text-white"
            >
              {isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t('web3.networkGuardV2.switching')}
                </>
              ) : (
                <>
                  {t('web3.networkGuardV2.switchAction', { network: targetChain.name })}
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      </div>

      {/* Overlay blocking content */}
      <div className="relative" style={{ marginTop: '60px' }}>
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-slate-900 border border-red-500/30 rounded-xl p-8 max-w-md text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              {t('web3.networkGuardV2.modalTitle')}
            </h2>
            <p className="text-slate-400 mb-6">
              {t('web3.networkGuardV2.modalMessage', { network: targetChain.name })}
            </p>
            <Button
              onClick={handleSwitchNetwork}
              disabled={isPending}
              size="lg"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              {isPending ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  {t('web3.networkGuardV2.modalSwitching')}
                </>
              ) : (
                <>
                  {t('web3.networkGuardV2.switchAction', { network: targetChain.name })}
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="opacity-20 pointer-events-none">
          {children}
        </div>
      </div>
    </>
  );
}
