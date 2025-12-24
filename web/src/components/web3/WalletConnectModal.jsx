import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from '@/hooks/useTranslation';

const WALLET_OPTIONS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    descKey: 'wallet.metamaskDesc',
    icon: '🦊',
    color: 'from-orange-500 to-yellow-500',
    installUrl: 'https://metamask.io/download/',
    type: 'injected',
    detectFunc: () => window.ethereum?.isMetaMask
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    descKey: 'wallet.walletconnectDesc',
    icon: '📱',
    color: 'from-blue-500 to-cyan-500',
    installUrl: 'https://walletconnect.com/',
    type: 'walletconnect',
    detectFunc: () => true // Always available (QR code)
  },
  {
    id: 'trustwallet',
    name: 'Trust Wallet',
    descKey: 'wallet.trustwalletDesc',
    icon: '🛡️',
    color: 'from-blue-600 to-blue-700',
    installUrl: 'https://trustwallet.com/download',
    type: 'injected',
    detectFunc: () => window.ethereum?.isTrust
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    descKey: 'wallet.coinbaseDesc',
    icon: '🔵',
    color: 'from-blue-500 to-indigo-600',
    installUrl: 'https://www.coinbase.com/wallet',
    type: 'injected',
    detectFunc: () => window.ethereum?.isCoinbaseWallet
  },
  {
    id: 'binance',
    name: 'Binance Wallet',
    descKey: 'wallet.binanceDesc',
    icon: '🟡',
    color: 'from-yellow-400 to-yellow-600',
    installUrl: 'https://www.binance.com/en/wallet',
    type: 'injected',
    detectFunc: () => window.BinanceChain
  },
  {
    id: 'injected',
    name: 'Browser Wallet',
    descKey: 'wallet.browserWalletDesc',
    icon: '🌐',
    color: 'from-purple-500 to-pink-500',
    installUrl: null,
    type: 'injected',
    detectFunc: () => window.ethereum
  }
];

export default function WalletConnectModal({ open, onOpenChange, onConnect }) {
  const { t } = useTranslation();
  const [connecting, setConnecting] = React.useState(null);
  const [error, setError] = React.useState(null);

  const handleConnect = async (wallet) => {
    setConnecting(wallet.id);
    setError(null);

    try {
      if (wallet.type === 'walletconnect') {
        // TODO: Implement WalletConnect integration
        throw new Error('WalletConnect integration coming soon');
      } else if (wallet.type === 'injected') {
        // Check if wallet is installed
        if (!wallet.detectFunc()) {
          if (wallet.installUrl) {
            window.open(wallet.installUrl, '_blank');
            setError(`${wallet.name} not detected. Please install it first.`);
          } else {
            setError('No Web3 wallet detected. Please install MetaMask or another wallet.');
          }
          setConnecting(null);
          return;
        }

        // Connect using the specific provider if available
        let provider = window.ethereum;
        
        if (wallet.id === 'binance' && window.BinanceChain) {
          provider = window.BinanceChain;
        }

        // Call the parent's connect function
        await onConnect(provider);
        onOpenChange(false);
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">🔗</span>
            {t('wallet.connectYourWallet')}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {t('wallet.choosePreferred')}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 text-sm font-medium">{t('wallet.connectionError')}</p>
              <p className="text-red-300 text-xs mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {WALLET_OPTIONS.map((wallet, index) => {
            const isInstalled = wallet.detectFunc();
            const isConnecting = connecting === wallet.id;

            return (
              <motion.button
                key={wallet.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleConnect(wallet)}
                disabled={isConnecting}
                className={`w-full p-4 rounded-xl border transition-all text-left ${
                  isConnecting
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {wallet.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{wallet.name}</h3>
                      {isInstalled && wallet.installUrl && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {t('wallet.installed')}
                        </Badge>
                      )}
                      {!isInstalled && wallet.installUrl && (
                        <Badge className="bg-slate-700 text-slate-400 border-slate-600 text-xs">
                          {t('wallet.notInstalled')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">{t(wallet.descKey)}</p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {isConnecting ? (
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    ) : !isInstalled && wallet.installUrl ? (
                      <ExternalLink className="w-5 h-5 text-slate-500" />
                    ) : null}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-700">
          <div className="flex items-start gap-2 text-xs text-slate-400">
            <span className="text-base">ℹ️</span>
            <p>
              {t('wallet.newToCryptoWallets')}{' '}
              <a 
                href="https://ethereum.org/en/wallets/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {t('wallet.learnMoreWallets')}
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}