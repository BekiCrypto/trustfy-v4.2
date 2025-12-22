import React from 'react';
import { useAccount, useDisconnect, useChainId } from 'wagmi';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Loader2, LogOut, Copy, ExternalLink, Shield, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from './useAuth';
import { useBondCredits } from './useContractInteraction';
import { SUPPORTED_CHAINS } from './wagmiConfig';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthenticationModal from './AuthenticationModal';

export default function WalletButtonV2({ variant = "default", size = "default" }) {
  // Gracefully handle missing Wagmi context
  let address, isConnected, chainId, disconnect, isAuthenticated, isAuthenticating, bondCredits;
  
  try {
    const account = useAccount();
    const chain = useChainId();
    const disconnectWagmi = useDisconnect();
    const auth = useAuth();
    const credits = useBondCredits(
      account.address, 
      '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd' // USDT on BSC Testnet
    );
    
    address = account.address;
    isConnected = account.isConnected;
    chainId = chain;
    disconnect = disconnectWagmi.disconnect;
    isAuthenticated = auth.isAuthenticated;
    isAuthenticating = auth.isAuthenticating;
    bondCredits = credits.bondCredits;
  } catch (e) {
    // Fallback when Wagmi context is not available (e.g., on public pages)
    address = null;
    isConnected = false;
    chainId = null;
    disconnect = () => {};
    isAuthenticated = false;
    isAuthenticating = false;
    bondCredits = '0';
  }

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  const openExplorer = () => {
    const chain = SUPPORTED_CHAINS[chainId];
    if (chain && address) {
      window.open(`${chain.blockExplorers.default.url}/address/${address}`, '_blank');
    }
  };

  const [showAuthModal, setShowAuthModal] = React.useState(false);

  const handleConnect = async () => {
    setShowAuthModal(true);
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success('Wallet disconnected');
  };

  const getChainColor = (id) => {
    if (id === 56) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (id === 97) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  // Not connected state
  if (!isConnected) {
    return (
      <>
        <Button
          onClick={handleConnect}
          variant={variant}
          size={size}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
        <AuthenticationModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </>
    );
  }

  // Connected but not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Button
          onClick={() => setShowAuthModal(true)}
          disabled={isAuthenticating}
          variant={variant}
          size={size}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold"
        >
          {isAuthenticating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Sign to Authenticate
            </>
          )}
        </Button>
        <AuthenticationModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </>
    );
  }

  const chain = SUPPORTED_CHAINS[chainId];

  // Connected and authenticated
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className="font-mono bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-lg"
        >
          <Wallet className="w-4 h-4 mr-2 text-emerald-400" />
          <span className="text-white">{formatAddress(address)}</span>
          {chain && (
            <Badge className={`ml-2 text-xs border ${getChainColor(chainId)}`}>
              {chain.name}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-slate-900 border-slate-700 w-72 shadow-xl" align="end">
        {/* Wallet Info */}
        <DropdownMenuLabel className="text-slate-400 text-xs uppercase">
          Connected Wallet
        </DropdownMenuLabel>
        <div className="px-2 py-3 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-white text-sm font-mono">{formatAddress(address)}</span>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
          {chain && (
            <Badge className={`text-xs border ${getChainColor(chainId)}`}>
              {chain.name}
            </Badge>
          )}
        </div>
        
        {/* Bond Credits */}
        {bondCredits !== '0' && (
          <div className="px-2 py-2 mb-2 bg-purple-500/10 rounded-lg mx-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-400">Bond Credits (USDT)</span>
              <span className="text-sm font-semibold text-white">{parseFloat(bondCredits).toFixed(4)}</span>
            </div>
          </div>
        )}
        
        <DropdownMenuSeparator className="bg-slate-700" />

        {/* Actions */}
        <DropdownMenuItem 
          onClick={copyAddress} 
          className="text-slate-300 focus:text-white focus:bg-slate-800 cursor-pointer"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={openExplorer} 
          className="text-slate-300 focus:text-white focus:bg-slate-800 cursor-pointer"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>

        <Link to={createPageUrl('BondCredits')}>
          <DropdownMenuItem className="text-slate-300 focus:text-white focus:bg-slate-800 cursor-pointer">
            <TrendingUp className="w-4 h-4 mr-2" />
            Manage Bond Credits
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator className="bg-slate-700" />

        <DropdownMenuItem 
          onClick={handleDisconnect} 
          className="text-red-400 focus:text-red-300 focus:bg-slate-800 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
