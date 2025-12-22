import React, { useState } from 'react';
import { useWallet } from "../web3/WalletContext";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Lock, 
  Unlock, 
  Loader2, 
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { EXPLORERS, CONTRACT_ADDRESSES } from "../web3/contractABI";
import { BEP20Helper } from "../web3/BEP20Helper";
import ErrorRecovery from "./ErrorRecovery";

export default function EscrowManager({ trade, onUpdate, onBondAmountLoaded, onEscrowStatusLoaded }) {
  const { account, fundEscrow, releaseFunds, confirmPaymentOnChain, getBondAmount, getTokenBalance, getEscrowStatus, getBondCredits } = useWallet();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);
  const [bondAmount, setBondAmount] = useState(null);
  const [bondCredits, setBondCredits] = useState(null);
  const [lastError, setLastError] = useState(null);
  
  const isSeller = account?.toLowerCase() === trade.seller_address?.toLowerCase();
  const isBuyer = account?.toLowerCase() === trade.buyer_address?.toLowerCase();
  
  React.useEffect(() => {
    const fetchData = async () => {
      if (account && trade.chain && trade.token_symbol) {
        try {
          const bal = await getTokenBalance(trade.chain, trade.token_symbol);
          setBalance(bal);
          
          // Fetch bond amount for this trade
          if (trade.amount) {
            const bond = await getBondAmount(trade.chain, trade.amount);
            setBondAmount(bond);
            if (onBondAmountLoaded) onBondAmountLoaded(bond);
          }
          
          // Fetch bond credits (V3 feature)
          if (getBondCredits) {
            const credits = await getBondCredits(trade.chain, trade.token_symbol, account);
            setBondCredits(credits);
          }
          
          // Fetch escrow status from chain
          if (trade.trade_id) {
            const status = await getEscrowStatus(trade.trade_id, trade.chain);
            if (onEscrowStatusLoaded) onEscrowStatusLoaded(status);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };
    fetchData();
  }, [account, trade.chain, trade.token_symbol, trade.amount, trade.trade_id]);
  
  const handleFundEscrow = async () => {
    // STATE MACHINE CHECK: Only allow funding if status is 'pending'
    if (trade.status !== 'pending') {
      toast.error('Cannot fund escrow - trade is not in pending state');
      return;
    }
    
    // ROLE CHECK: Only seller can fund
    if (!isSeller) {
      toast.error('Only the seller can fund the escrow');
      return;
    }
    
    setLoading(true);
    toast.loading('Preparing escrow funding...', { id: 'escrow-fund' });
    
    try {
      // Validate escrow contract is deployed
      const escrowAddress = CONTRACT_ADDRESSES[trade.chain]?.escrow;
      if (!escrowAddress || escrowAddress === '0x0000000000000000000000000000000000000000') {
        toast.error('Escrow contract not deployed. Please contact support.', { id: 'escrow-fund' });
        setLoading(false);
        return;
      }

      // Calculate total escrow amount (amount + fees + bond)
      const escrowAmount = parseFloat(trade.escrow_amount || trade.amount);
      const requiredBond = parseFloat(bondAmount || 0);
      const totalRequired = escrowAmount + requiredBond;
      
      toast.loading(`Approving ${totalRequired.toFixed(4)} ${trade.token_symbol}...`, { id: 'escrow-fund' });
      
      // Validate and approve tokens
      const tokenAddress = BEP20Helper.getTokenAddress(trade.token_symbol, trade.chain);
      const validation = await BEP20Helper.validateBalanceAndAllowance(
        tokenAddress,
        account,
        escrowAddress,
        totalRequired,
        window.ethereum
      );

      if (!validation.valid) {
        if (validation.needsApproval) {
          toast.loading('Requesting token approval...', { id: 'escrow-fund' });
          const web3Provider = new (await import('ethers')).BrowserProvider(window.ethereum);
          const signer = await web3Provider.getSigner();
          
          await BEP20Helper.approveToken(
            tokenAddress,
            escrowAddress,
            totalRequired,
            signer
          );
          toast.success('Tokens approved!', { id: 'escrow-fund' });
        } else {
          toast.error(validation.error, { id: 'escrow-fund' });
          setLoading(false);
          return;
        }
      }
      
      toast.loading('Funding escrow on blockchain...', { id: 'escrow-fund' });
      
      // Fund escrow on blockchain
      const txHash = await fundEscrow(
        trade.trade_id,
        trade.chain,
        trade.token_symbol,
        escrowAmount,
        Math.round(trade.maker_fee * 100),
        Math.round(trade.taker_fee * 100)
      );
      
      toast.loading('Updating trade status...', { id: 'escrow-fund' });
      
      // Update trade status in database
      await base44.entities.Trade.update(trade.id, {
        status: 'funded',
        tx_hash: txHash,
        seller_signed: true
      });
      
      // Sync blockchain status (if function exists)
      try {
        await base44.functions.invoke('syncBlockchainStatus', {
          trade_id: trade.id,
          tx_hash: txHash,
          event_type: 'escrow_funded'
        });
      } catch (err) {
        console.log('Sync function not available:', err.message);
      }
      
      // Send notification (if function exists)
      try {
        await base44.functions.invoke('tradeNotifications', {
          trade_id: trade.id,
          event_type: 'escrow_funded'
        });
      } catch (err) {
        console.log('Notification function not available:', err.message);
      }
      
      toast.success('Escrow funded successfully!', {
        id: 'escrow-fund',
        description: `Locked ${escrowAmount.toFixed(2)} ${trade.token_symbol} + ${requiredBond.toFixed(2)} ${trade.token_symbol} bond`,
        duration: 5000,
        action: {
          label: 'View TX',
          onClick: () => window.open(`${EXPLORERS[trade.chain]}/tx/${txHash}`, '_blank')
        }
      });
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error funding escrow:', error);
      setLastError(error);
      const errorMsg = error.message || error.reason || 'Failed to fund escrow';
      toast.error(errorMsg, { 
        id: 'escrow-fund',
        duration: 5000,
        description: 'Please try again or contact support'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmPayment = async () => {
    // STATE MACHINE CHECK: Only allow if status is 'funded'
    if (trade.status !== 'funded') {
      toast.error('Cannot confirm payment - seller must fund escrow first');
      return;
    }
    
    // ROLE CHECK: Only buyer can confirm
    if (!isBuyer) {
      toast.error('Only the buyer can confirm payment');
      return;
    }
    
    if (!bondAmount) {
      toast.error('Bond amount not loaded. Please refresh page.');
      return;
    }

    // Check if payment evidence was submitted
    if (!trade.payment_evidence) {
      toast.error('Please submit payment proof first via the "I\'ve Paid" button');
      return;
    }
    
    if (!confirm(`Lock buyer bond (${bondAmount} ${trade.token_symbol}) to confirm off-chain payment? This confirms you've sent the fiat payment.`)) return;
    
    setLoading(true);
    toast.loading('Locking buyer bond...', { id: 'bond-lock' });
    
    try {
      // Buyer locks bond on blockchain
      const txHash = await confirmPaymentOnChain(trade.trade_id, trade.chain, trade.token_symbol, bondAmount);
      
      toast.loading('Updating trade status...', { id: 'bond-lock' });
      
      // Update trade status
      await base44.entities.Trade.update(trade.id, {
        status: 'in_progress',
        buyer_signed: true
      });
      
      // Sync blockchain status (if function exists)
      try {
        await base44.functions.invoke('syncBlockchainStatus', {
          trade_id: trade.id,
          tx_hash: txHash,
          event_type: 'payment_confirmed'
        });
      } catch (err) {
        console.log('Sync function not available:', err.message);
      }
      
      // Send notification (if function exists)
      try {
        await base44.functions.invoke('tradeNotifications', {
          trade_id: trade.id,
          event_type: 'payment_confirmed'
        });
      } catch (err) {
        console.log('Notification function not available:', err.message);
      }
      
      toast.success('Bond locked successfully!', {
        id: 'bond-lock',
        description: `${bondAmount} ${trade.token_symbol} bond secured. Waiting for seller to release.`,
        duration: 5000,
        action: {
          label: 'View TX',
          onClick: () => window.open(`${EXPLORERS[trade.chain]}/tx/${txHash}`, '_blank')
        }
      });
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error confirming payment:', error);
      const errorMsg = error.message || error.reason || 'Failed to lock bond';
      toast.error(errorMsg, { 
        id: 'bond-lock',
        duration: 5000,
        description: 'Please try again or contact support'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleReleaseFunds = async () => {
    // STATE MACHINE CHECK: Only allow if status is 'in_progress'
    if (trade.status !== 'in_progress') {
      toast.error('Cannot release funds - buyer must confirm payment first');
      return;
    }
    
    // ROLE CHECK: Only seller can release
    if (!isSeller) {
      toast.error('Only the seller can release funds');
      return;
    }

    // Check payment evidence
    if (!trade.payment_evidence) {
      toast.error('Buyer has not submitted payment proof yet');
      return;
    }
    
    if (!confirm(`Release ${trade.amount} ${trade.token_symbol} to buyer?\n\nBoth bonds will be converted to reusable credits.\nThis action cannot be undone.`)) return;
    
    setLoading(true);
    toast.loading('Releasing funds...', { id: 'release-funds' });
    
    try {
      // Release funds on blockchain
      const txHash = await releaseFunds(trade.trade_id, trade.chain);
      
      toast.loading('Updating trade status...', { id: 'release-funds' });
      
      // Update trade status
      await base44.entities.Trade.update(trade.id, {
        status: 'completed'
      });
      
      // Sync blockchain status (if function exists)
      try {
        await base44.functions.invoke('syncBlockchainStatus', {
          trade_id: trade.id,
          tx_hash: txHash,
          event_type: 'funds_released'
        });
      } catch (err) {
        console.log('Sync function not available:', err.message);
      }
      
      // Send notification (if function exists)
      try {
        await base44.functions.invoke('tradeNotifications', {
          trade_id: trade.id,
          event_type: 'funds_released'
        });
      } catch (err) {
        console.log('Notification function not available:', err.message);
      }
      
      // Update reputation scores (if function exists)
      try {
        await Promise.all([
          base44.functions.invoke('calculateReputationScore', {
            wallet_address: trade.seller_address
          }),
          base44.functions.invoke('calculateReputationScore', {
            wallet_address: trade.buyer_address
          })
        ]);
      } catch (err) {
        console.log('Reputation function not available:', err.message);
      }
      
      toast.success('Trade completed successfully!', {
        id: 'release-funds',
        description: `${trade.amount} ${trade.token_symbol} released. Both bonds converted to credits.`,
        duration: 5000,
        action: {
          label: 'View TX',
          onClick: () => window.open(`${EXPLORERS[trade.chain]}/tx/${txHash}`, '_blank')
        }
      });
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error releasing funds:', error);
      const errorMsg = error.message || error.reason || 'Failed to release funds';
      toast.error(errorMsg, { 
        id: 'release-funds',
        duration: 5000,
        description: 'Please try again or contact support'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const requiredAmount = isSeller 
    ? parseFloat(trade.escrow_amount || trade.amount) + parseFloat(bondAmount || 0)
    : isBuyer 
    ? parseFloat(bondAmount || 0)
    : 0;
    
  const hasInsufficientBalance = balance && parseFloat(balance) < requiredAmount;
  
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 p-6">
      {/* Status Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Lock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Smart Contract Escrow</h3>
            <p className="text-slate-400 text-xs">Secure multi-signature escrow</p>
          </div>
        </div>
        {trade.tx_hash && (
          <a
            href={`${EXPLORERS[trade.chain]}/tx/${trade.tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            View TX
          </a>
        )}
      </div>
      
      {/* Escrow Details */}
      <div className="space-y-3 mb-6">
        {trade.status === 'pending' && isSeller && (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs text-amber-400 mb-2 font-semibold">⚠️ Action Required</p>
            <p className="text-sm text-white">Fund escrow to activate trade</p>
          </div>
        )}
        
        {trade.status === 'funded' && isBuyer && (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs text-blue-400 mb-2 font-semibold">⚠️ Action Required</p>
            <p className="text-sm text-white">Lock buyer bond after sending fiat payment</p>
          </div>
        )}
        
        {trade.status === 'in_progress' && isSeller && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-xs text-emerald-400 mb-2 font-semibold">⚠️ Action Required</p>
            <p className="text-sm text-white">Release funds after confirming fiat receipt</p>
          </div>
        )}
        
        {balance && (
          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
            <span className="text-slate-400 text-sm">Your Balance</span>
            <span className={`font-semibold ${hasInsufficientBalance ? 'text-red-400' : 'text-emerald-400'}`}>
              {parseFloat(balance).toFixed(4)} {trade.token_symbol}
            </span>
          </div>
        )}
        
        {bondCredits !== null && parseFloat(bondCredits) > 0 && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 text-sm font-medium">Bond Credits</span>
              </div>
              <span className="text-white font-semibold">
                {parseFloat(bondCredits).toFixed(4)} {trade.token_symbol}
              </span>
            </div>
            <p className="text-xs text-purple-300 mt-1">
              Reusable bond balance from previous trades
            </p>
          </div>
        )}
        
        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
          <span className="text-slate-400 text-sm">Chain</span>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            {trade.chain}
          </Badge>
        </div>
      </div>
      
      {/* Escrow Status Grid */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className={`p-2 rounded-lg border text-center ${
          trade.status === 'funded' || trade.status === 'in_progress' || trade.status === 'completed'
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-slate-800/50 border-slate-700/50'
        }`}>
          <Lock className={`w-4 h-4 mx-auto mb-1 ${
            trade.status === 'funded' || trade.status === 'in_progress' || trade.status === 'completed' ? 'text-emerald-400' : 'text-slate-500'
          }`} />
          <p className="text-xs text-slate-400">Seller Bond</p>
        </div>
        
        <div className={`p-2 rounded-lg border text-center ${
          trade.status === 'in_progress' || trade.status === 'completed'
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-slate-800/50 border-slate-700/50'
        }`}>
          <Lock className={`w-4 h-4 mx-auto mb-1 ${
            trade.status === 'in_progress' || trade.status === 'completed' ? 'text-emerald-400' : 'text-slate-500'
          }`} />
          <p className="text-xs text-slate-400">Buyer Bond</p>
        </div>
        
        <div className={`p-2 rounded-lg border text-center ${
          trade.status === 'completed'
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-slate-800/50 border-slate-700/50'
        }`}>
          <Unlock className={`w-4 h-4 mx-auto mb-1 ${
            trade.status === 'completed' ? 'text-emerald-400' : 'text-slate-500'
          }`} />
          <p className="text-xs text-slate-400">Released</p>
        </div>
      </div>
      
      {/* Actions */}
      {isSeller && trade.status === 'pending' && (
        <div className="space-y-3">
          {hasInsufficientBalance && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Insufficient balance to fund escrow</span>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleFundEscrow}
            disabled={loading || !account || hasInsufficientBalance}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Fund Escrow
              </>
            )}
          </Button>
        </div>
      )}
      
      {isBuyer && trade.status === 'funded' && (
        <div className="space-y-3">
          {hasInsufficientBalance && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Insufficient balance for buyer bond ({bondAmount} {trade.token_symbol})</span>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleConfirmPayment}
            disabled={loading || !account || hasInsufficientBalance || !bondAmount}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Lock Bond & Confirm Payment
              </>
            )}
          </Button>
          <p className="text-xs text-slate-400 text-center">
            You'll lock {bondAmount} {trade.token_symbol} as buyer bond
          </p>
        </div>
      )}
      
      {isSeller && trade.status === 'in_progress' && (
        <div className="space-y-3">
          {!trade.payment_evidence && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Waiting for buyer to submit payment proof</span>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleReleaseFunds}
            disabled={loading || !account || !trade.payment_evidence}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Releasing...
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Release Funds (Refund Bonds)
              </>
            )}
          </Button>
          
          {trade.payment_evidence && (
            <p className="text-xs text-emerald-400 text-center">
              ✓ Payment proof submitted - you may release funds
            </p>
          )}
        </div>
      )}
      
      {!account && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-2 text-amber-400 text-sm">
            <Wallet className="w-4 h-4" />
            <span>Connect your wallet to interact with escrow</span>
          </div>
        </div>
      )}

      {/* Error Recovery */}
      {lastError && !loading && (
        <div className="mt-4">
          <ErrorRecovery 
            error={lastError}
            trade={trade}
            onRetry={() => {
              setLastError(null);
              if (isSeller && trade.status === 'pending') handleFundEscrow();
              if (isBuyer && trade.status === 'funded') handleConfirmPayment();
              if (isSeller && trade.status === 'in_progress') handleReleaseFunds();
            }}
            onRefresh={() => {
              setLastError(null);
              window.location.reload();
            }}
          />
        </div>
      )}
    </Card>
  );
}