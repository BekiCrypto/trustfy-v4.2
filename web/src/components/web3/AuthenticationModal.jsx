import React, { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wallet, 
  Shield, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle,
  Sparkles,
  Lock,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from './useAuth';

/**
 * Professional authentication modal
 * Guides users through: Connect Wallet → Sign Message → Authenticated
 */
export default function AuthenticationModal({ open, onOpenChange }) {
  const { isConnected, address } = useAccount();
  const { connectAsync, connectors, isPending, error: connectError } = useConnect();
  const { authenticate, isAuthenticating, authError, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isConnected) {
      setStep(2);
    } else {
      setStep(1);
    }
  }, [isConnected]);

  useEffect(() => {
    if (isAuthenticated) {
      // Close modal after successful auth
      setTimeout(() => {
        onOpenChange(false);
        setStep(1);
      }, 1500);
    }
  }, [isAuthenticated, onOpenChange]);

  const handleConnectWallet = async (connector) => {
    if (!connector) return;
    await connectAsync({ connector });
  };

  const handleAuthenticate = async () => {
    await authenticate();
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Authenticate with Web3
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Connect your wallet and sign to prove ownership
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2">
            <StepIndicator number={1} active={step === 1} completed={step > 1} label="Connect" />
            <div className={`h-0.5 w-8 ${step > 1 ? 'bg-blue-500' : 'bg-slate-700'}`} />
            <StepIndicator number={2} active={step === 2} completed={step > 2} label="Sign" />
            <div className={`h-0.5 w-8 ${step > 2 ? 'bg-blue-500' : 'bg-slate-700'}`} />
            <StepIndicator number={3} active={step === 3} completed={isAuthenticated} label="Done" />
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Connect Wallet */}
            {!isConnected && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto">
                    <Wallet className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold">Connect Your Wallet</h3>
                  <p className="text-slate-400 text-sm">
                    Select a wallet to continue
                  </p>
                </div>

                <div className="space-y-2">
                  {connectors
                    .filter((connector) => connector.ready && connector.id !== "walletConnect")
                    .map((connector) => (
                      <Button
                        key={connector.id}
                        onClick={() => handleConnectWallet(connector)}
                        disabled={isPending}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
                        size="lg"
                      >
                        <Wallet className="w-5 h-5 mr-2" />
                        {isPending ? "Connecting..." : `Connect ${connector.name}`}
                      </Button>
                    ))}
                </div>

                {connectError && (
                  <Alert className="bg-red-500/10 border-red-500/30">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300 text-xs">
                      {connectError.message || "Failed to connect wallet"}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <p className="text-xs text-slate-500 text-center">Supported wallets:</p>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {connectors
                      .filter((connector) => connector.ready && connector.id !== "walletConnect")
                      .map((connector) => (
                        <div
                          key={connector.id}
                          className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs"
                        >
                          {connector.name}
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Sign Message */}
            {isConnected && !isAuthenticated && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold">Sign Authentication Message</h3>
                  <p className="text-slate-400 text-sm">
                    Prove you own wallet {formatAddress(address)}
                  </p>
                </div>

                <Alert className="bg-blue-500/10 border-blue-500/30">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-300 text-xs">
                    <strong>Free signature</strong> - No on-chain transaction required
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleAuthenticate}
                  disabled={isAuthenticating}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12"
                  size="lg"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Sign to Authenticate
                    </>
                  )}
                </Button>

                {authError && (
                  <Alert className="bg-red-500/10 border-red-500/30">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300 text-xs">
                      {authError}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2 pt-2">
                  <p className="text-xs text-slate-500 text-center">Why do I need to sign?</p>
                  <div className="space-y-1">
                    {[
                      'Proves you own the wallet',
                      'Creates a secure session',
                      'Free - no gas costs'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {isAuthenticated && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="text-center space-y-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                  <h3 className="text-white font-semibold">Successfully Authenticated!</h3>
                  <p className="text-slate-400 text-sm">
                    You can now access all platform features
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepIndicator({ number, active, completed, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
        completed ? 'bg-emerald-500 text-white' :
        active ? 'bg-blue-500 text-white' :
        'bg-slate-700 text-slate-400'
      }`}>
        {completed ? <CheckCircle2 className="w-4 h-4" /> : number}
      </div>
      <span className={`text-xs ${active || completed ? 'text-white' : 'text-slate-500'}`}>
        {label}
      </span>
    </div>
  );
}
