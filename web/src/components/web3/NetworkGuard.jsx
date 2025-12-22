import React from 'react';
import { useWallet } from './WalletContext';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { CHAIN_IDS } from './contractABI';
import { useTranslation } from 'react-i18next';

export default function NetworkGuard({ children, requiredChainId = CHAIN_IDS.BSC }) {
  const { chainId, switchChain, account } = useWallet();
  const { t } = useTranslation();
  
  // If not connected, show children (they'll see wallet connection prompt)
  if (!account) {
    return <>{children}</>;
  }
  
  // If on wrong network, block all actions
  if (chainId !== requiredChainId) {
    const networkName =
      requiredChainId === 97 ? 'BSC Testnet' : requiredChainId === 56 ? 'BSC Mainnet' : 'BSC';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="bg-slate-900/90 border-amber-500/30 p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {t('web3.networkGuard.title')}
            </h2>
            <p className="text-slate-400 mb-6">
              {t('web3.networkGuard.description', { network: networkName })}
            </p>
            
            <Alert className="bg-amber-500/10 border-amber-500/30 mb-6 text-left">
              <AlertDescription className="text-amber-300 text-sm">
                {t('web3.networkGuard.currentNetwork')}{' '}
                <strong>{t('web3.networkGuard.chainId', { chainId })}</strong>
                <br />
                {t('web3.networkGuard.requiredNetwork')}{' '}
                <strong>{t('web3.networkGuard.requiredValue', { network: networkName, chainId: requiredChainId })}</strong>
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={() => switchChain(requiredChainId)}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('web3.networkGuard.switchTo', { network: networkName })}
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return <>{children}</>;
}
