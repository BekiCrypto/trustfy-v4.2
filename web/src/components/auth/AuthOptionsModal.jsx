import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Wallet, Mail, Chrome, Facebook, Shield, Star, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAccount, useConnect } from 'wagmi';
import { toast } from "sonner";

export default function AuthOptionsModal({ open, onOpenChange }) {
  const { connectAsync, connectors, isPending, error: connectError } = useConnect();
  const { address, isConnected } = useAccount();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleWalletConnect = async () => {
    try {
      const connector = connectors.find(
        (item) => item.ready && item.id !== "walletConnect"
      );
      if (!connector) {
        toast.error('No supported wallet connector found');
        return;
      }
      await connectAsync({ connector });
    } catch (error) {
      console.error('Failed to open wallet modal:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const handleOAuth = (provider) => {
    setIsAuthenticating(true);
    // OAuth2 flow - redirect to platform login
    base44.auth.redirectToLogin(createPageUrl('SetupProfile'));
  };

  // When wallet successfully connects, proceed to dashboard
  React.useEffect(() => {
    if (isConnected && address && open) {
      // Wallet is connected, redirect to setup/dashboard
      // This uses wallet-based authentication
      base44.auth.redirectToLogin(createPageUrl('SetupProfile'));
    }
  }, [isConnected, address, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Login Method
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-center">
            Select how you want to access TRUSTFY
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-6">
          {/* Wallet Connect - Recommended */}
          <Card className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-6 hover:border-blue-500/50 transition-all">
            <Badge className="absolute top-4 right-4 bg-emerald-500 text-white">
              Recommended
            </Badge>
            
            <div className="mb-4">
              <div className="p-3 rounded-xl bg-blue-500/20 w-fit mb-3">
                <Wallet className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Wallet Connect
              </h3>
              <p className="text-slate-300 text-sm mb-4">
                Connect your Web3 wallet for complete privacy and security
              </p>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">No personal data required</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Complete anonymity</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Full platform access</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">Non-custodial & secure</span>
              </div>
            </div>

            <Button
              onClick={handleWalletConnect}
              disabled={isConnected || isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isConnected ? 'Wallet Connected' : isPending ? 'Connecting...' : 'Connect Wallet'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {connectError && (
              <p className="text-xs text-red-400 text-center mt-2">
                {connectError.message || 'Failed to connect wallet'}
              </p>
            )}

            <p className="text-xs text-slate-400 text-center mt-3 leading-relaxed">
              Use a supported Web3 wallet such as MetaMask or Coinbase Wallet to sign in securely.
            </p>
          </Card>

          {/* OAuth2 Options */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="mb-4">
              <div className="p-3 rounded-xl bg-purple-500/20 w-fit mb-3">
                <Star className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Social / Email Login
              </h3>
              <p className="text-slate-300 text-sm mb-4">
                Use your existing accounts for quick access
              </p>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">Quick & familiar login</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Account recovery options</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Email notifications</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-amber-300">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Wallet required for trading</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handleOAuth('google')}
                disabled={isAuthenticating}
                variant="outline"
                className="w-full border-slate-600 hover:bg-slate-700 hover:border-slate-500"
              >
                <Chrome className="w-4 h-4 mr-2" />
                Continue with Google
              </Button>

              <Button
                onClick={() => handleOAuth('facebook')}
                disabled={isAuthenticating}
                variant="outline"
                className="w-full border-slate-600 hover:bg-slate-700 hover:border-slate-500"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Continue with Facebook
              </Button>

              <Button
                onClick={() => handleOAuth('email')}
                disabled={isAuthenticating}
                variant="outline"
                className="w-full border-slate-600 hover:bg-slate-700 hover:border-slate-500"
              >
                <Mail className="w-4 h-4 mr-2" />
                Continue with Email
              </Button>
            </div>

            <p className="text-xs text-amber-400 text-center mt-4">
              Note: You'll need to connect a wallet before your first escrow action
            </p>
          </Card>
        </div>

        <div className="text-center text-xs text-slate-500 border-t border-slate-800 pt-4">
          By continuing, you agree to our{' '}
          <button
            onClick={() => window.location.href = createPageUrl('Docs')}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Terms & Conditions
          </button>
          {' '}and{' '}
          <button
            onClick={() => window.location.href = createPageUrl('Docs')}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Privacy Policy
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
