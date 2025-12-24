import React from 'react';
import { useWallet } from './WalletContext';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Loader2, LogOut, Copy, ExternalLink, User, Shield } from "lucide-react";
import { useTranslation } from '@/hooks/useTranslation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import WalletConnectModal from './WalletConnectModal';

export default function WalletButton({ variant = "default", size = "default" }) {
  const { t } = useTranslation();
  const { account, chainId, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const [currentUser, setCurrentUser] = React.useState(null);
  const [showWalletModal, setShowWalletModal] = React.useState(false);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, []);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    toast.success('Address copied to clipboard');
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const openExplorer = () => {
    const explorerUrl = chainId === 56 
      ? `https://bscscan.com/address/${account}`
      : chainId === 97
      ? `https://testnet.bscscan.com/address/${account}`
      : `https://etherscan.io/address/${account}`;
    window.open(explorerUrl, '_blank');
  };

  const chainNames = {
    56: 'BSC Mainnet',
    97: 'BSC Testnet',
    137: 'Polygon',
    42161: 'Arbitrum',
    10: 'Optimism',
    1: 'Ethereum'
  };

  const getChainColor = (id) => {
    if (id === 56) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (id === 97) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  if (!account) {
    return (
      <>
        <Button
          onClick={() => setShowWalletModal(true)}
          disabled={isConnecting}
          variant={variant}
          size={size}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>
        
        <WalletConnectModal 
          open={showWalletModal} 
          onOpenChange={setShowWalletModal}
          onConnect={connectWallet}
        />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className="font-mono bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-lg"
        >
          <Wallet className="w-4 h-4 mr-2 text-emerald-400" />
          <span className="text-white">{formatAddress(account)}</span>
          {chainId && (
            <Badge className={`ml-2 text-xs border ${getChainColor(chainId)}`}>
              {chainNames[chainId] || `Chain ${chainId}`}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-slate-900 border-slate-700 w-64 shadow-xl" align="end">
        {/* User Info */}
        {currentUser && (
          <>
            <DropdownMenuLabel className="text-slate-400 text-xs uppercase">
              Account
            </DropdownMenuLabel>
            <div className="px-2 py-2 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-white text-sm font-medium">{currentUser.full_name || currentUser.email}</span>
              </div>
              <p className="text-slate-500 text-xs">{currentUser.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-slate-700" />
          </>
        )}

        {/* Wallet Info */}
        <DropdownMenuLabel className="text-slate-400 text-xs uppercase">
          Connected Wallet
        </DropdownMenuLabel>
        <div className="px-2 py-2 mb-2">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-white text-sm font-mono">{formatAddress(account)}</span>
          </div>
          {chainId && (
            <Badge className={`text-xs border ${getChainColor(chainId)}`}>
              {chainNames[chainId] || `Chain ${chainId}`}
            </Badge>
          )}
        </div>
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

        <DropdownMenuSeparator className="bg-slate-700" />

        <DropdownMenuItem 
          onClick={disconnectWallet} 
          className="text-amber-400 focus:text-amber-300 focus:bg-slate-800 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect Wallet
        </DropdownMenuItem>

        {currentUser && (
          <DropdownMenuItem 
            onClick={handleLogout} 
            className="text-red-400 focus:text-red-300 focus:bg-slate-800 cursor-pointer"
          >
            <Shield className="w-4 h-4 mr-2" />
            Logout from Platform
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}