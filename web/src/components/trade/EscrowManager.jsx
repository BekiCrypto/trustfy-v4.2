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
import { useWalletGuard } from "@/components/web3/useWalletGuard";
import { useTranslation } from "react-i18next";

export default function EscrowManager({ trade, onUpdate, onBondAmountLoaded, onEscrowStatusLoaded }) {
  const { t } = useTranslation();
  const { account, fundEscrow, releaseFunds, confirmPaymentOnChain, getBondAmount, getTokenBalance, getEscrowStatus, getBondCredits, getTokenConfig } = useWallet();
  const { ensureWallet, authModal } = useWalletGuard();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);
  const [bondAmount, setBondAmount] = useState(null);
  const [bondCredits, setBondCredits] = useState(null);
  const [lastError, setLastError] = useState(null);
  const [chainEscrow, setChainEscrow] = useState(null);
  const [tokenConfig, setTokenConfig] = useState(null);
  
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
            const bond = await getBondAmount(trade.chain, trade.amount, trade.token_symbol);
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
            setChainEscrow(status);
            if (onEscrowStatusLoaded) onEscrowStatusLoaded(status);
          }
          
          // Fetch token config for time windows
          try {
            const cfg = await getTokenConfig(trade.chain, trade.token_symbol);
            setTokenConfig(cfg);
          } catch (configError) {
            console.warn('Token config not available:', configError?.message);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };
    fetchData();
  }, [account, trade.chain, trade.token_symbol, trade.amount, trade.trade_id]);

  const mapChainStatus = (status) => {
    switch (status) {
      case 1:
        return 'pending';
      case 2:
        return 'funded';
      case 3:
        return 'in_progress';
      case 4:
        return 'disputed';
      case 5:
        return 'completed';
      case 6:
        return 'cancelled';
      default:
        return trade.status;
    }
  };

  const effectiveStatus = chainEscrow?.status !== undefined
    ? mapChainStatus(chainEscrow.status)
    : trade.status;

  const nowSeconds = Math.floor(Date.now() / 1000);
  const sellerFundDeadline =
    tokenConfig?.sellerFundWindow && chainEscrow?.takenAt
      ? chainEscrow.takenAt + tokenConfig.sellerFundWindow
      : null;
  const buyerConfirmDeadline =
    tokenConfig?.buyerConfirmWindow && chainEscrow?.fundedAt
      ? chainEscrow.fundedAt + tokenConfig.buyerConfirmWindow
      : null;
  const sellerReleaseDeadline =
    tokenConfig?.sellerReleaseWindow && chainEscrow?.paymentConfirmedAt
      ? chainEscrow.paymentConfirmedAt + tokenConfig.sellerReleaseWindow
      : null;

  const isFundingExpired = sellerFundDeadline ? nowSeconds > sellerFundDeadline : false;
  const isConfirmExpired = buyerConfirmDeadline ? nowSeconds > buyerConfirmDeadline : false;
  const isReleaseExpired = sellerReleaseDeadline ? nowSeconds > sellerReleaseDeadline : false;
  
  const handleFundEscrow = async () => {
    if (!ensureWallet()) return;
    // STATE MACHINE CHECK: Only allow funding if status is 'pending'
    if (effectiveStatus !== 'pending') {
      toast.error(t('trade.escrowManager.toastCannotFundState'));
      return;
    }
    if (isFundingExpired) {
      toast.error('Funding window expired. Buyer DisputeBond is refundable; AdBond forfeiture may apply.');
      return;
    }
    
    // ROLE CHECK: Only seller can fund
    if (!isSeller) {
      toast.error(t('trade.escrowManager.toastOnlySellerFund'));
      return;
    }
    
    setLoading(true);
    toast.loading(t('trade.escrowManager.toastPreparingFunding'), { id: 'escrow-fund' });
    
    try {
      // Validate escrow contract is deployed
      const escrowAddress = CONTRACT_ADDRESSES[trade.chain]?.escrow;
      if (!escrowAddress || escrowAddress === '0x0000000000000000000000000000000000000000') {
        toast.error(t('trade.escrowManager.toastContractNotDeployed'), { id: 'escrow-fund' });
        setLoading(false);
        return;
      }

      // Calculate total escrow amount (amount + fees + bond)
      const escrowAmount = parseFloat(trade.escrow_amount || trade.amount);
      const requiredBond = parseFloat(bondAmount || 0);
      const totalRequired = escrowAmount + requiredBond;
      
      toast.loading(
        t('trade.escrowManager.toastApprovingAmount', {
          amount: totalRequired.toFixed(4),
          token: trade.token_symbol
        }),
        { id: 'escrow-fund' }
      );
      
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
          toast.loading(t('trade.escrowManager.toastRequestingApproval'), { id: 'escrow-fund' });
          const web3Provider = new (await import('ethers')).BrowserProvider(window.ethereum);
          const signer = await web3Provider.getSigner();
          
          await BEP20Helper.approveToken(
            tokenAddress,
            escrowAddress,
            totalRequired,
            signer
          );
          toast.success(t('trade.escrowManager.toastTokensApproved'), { id: 'escrow-fund' });
        } else {
          toast.error(validation.error, { id: 'escrow-fund' });
          setLoading(false);
          return;
        }
      }
      
      toast.loading(t('trade.escrowManager.toastFundingOnChain'), { id: 'escrow-fund' });
      
      // Fund escrow on blockchain
      const txHash = await fundEscrow(
        trade.trade_id,
        trade.chain,
        trade.token_symbol,
        escrowAmount,
        Math.round(trade.maker_fee * 100),
        Math.round(trade.taker_fee * 100)
      );
      
      toast.loading(t('trade.escrowManager.toastUpdatingStatus'), { id: 'escrow-fund' });
      
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
      
      toast.success(t('trade.escrowManager.toastFundedSuccessTitle'), {
        id: 'escrow-fund',
        description: t('trade.escrowManager.toastFundedSuccessDesc', {
          amount: escrowAmount.toFixed(2),
          bond: requiredBond.toFixed(2),
          token: trade.token_symbol
        }),
        duration: 5000,
        action: {
          label: t('trade.escrowManager.viewTx'),
          onClick: () => window.open(`${EXPLORERS[trade.chain]}/tx/${txHash}`, '_blank')
        }
      });
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error funding escrow:', error);
      setLastError(error);
      const errorMsg = error.message || error.reason || t('trade.escrowManager.toastFundFailed');
      toast.error(errorMsg, { 
        id: 'escrow-fund',
        duration: 5000,
        description: t('trade.escrowManager.toastRetrySupport')
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmPayment = async () => {
    if (!ensureWallet()) return;
    // STATE MACHINE CHECK: Only allow if status is 'funded'
    if (effectiveStatus !== 'funded') {
      toast.error(t('trade.escrowManager.toastCannotConfirmPayment'));
      return;
    }
    if (isConfirmExpired) {
      toast.error('Confirmation window expired. Buyer DisputeBond may be forfeited.');
      return;
    }
    
    // ROLE CHECK: Only buyer can confirm
    if (!isBuyer) {
      toast.error(t('trade.escrowManager.toastOnlyBuyerConfirm'));
      return;
    }
    
    // Check if payment evidence was submitted
    if (!trade.payment_evidence) {
      toast.error(t('trade.escrowManager.toastPaymentProofRequired'));
      return;
    }
    
    if (!confirm('Confirm payment on-chain?')) return;
    
    setLoading(true);
    toast.loading('Confirming payment on-chain...', { id: 'bond-lock' });
    
    try {
      // Buyer confirms payment on blockchain
      const txHash = await confirmPaymentOnChain(trade.trade_id, trade.chain);
      
      toast.loading(t('trade.escrowManager.toastUpdatingStatus'), { id: 'bond-lock' });
      
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
      
      toast.success('Payment confirmed on-chain', {
        id: 'bond-lock',
        description: 'Seller can now release the escrow once fiat is verified.',
        duration: 5000,
        action: {
          label: t('trade.escrowManager.viewTx'),
          onClick: () => window.open(`${EXPLORERS[trade.chain]}/tx/${txHash}`, '_blank')
        }
      });
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error confirming payment:', error);
      const errorMsg = error.message || error.reason || t('trade.escrowManager.toastLockBondFailed');
      toast.error(errorMsg, { 
        id: 'bond-lock',
        duration: 5000,
        description: t('trade.escrowManager.toastRetrySupport')
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleReleaseFunds = async () => {
    if (!ensureWallet()) return;
    // STATE MACHINE CHECK: Only allow if status is 'in_progress'
    if (effectiveStatus !== 'in_progress') {
      toast.error(t('trade.escrowManager.toastCannotReleaseFunds'));
      return;
    }
    if (isReleaseExpired) {
      toast.error('Release window expired. Buyer may open a dispute.');
      return;
    }
    
    // ROLE CHECK: Only seller can release
    if (!isSeller) {
      toast.error(t('trade.escrowManager.toastOnlySellerRelease'));
      return;
    }

    // Check payment evidence
    if (!trade.payment_evidence) {
      toast.error(t('trade.escrowManager.toastBuyerNoProof'));
      return;
    }
    
    if (!confirm(
      t('trade.escrowManager.confirmReleaseFunds', {
        amount: trade.amount,
        token: trade.token_symbol
      })
    )) return;
    
    setLoading(true);
    toast.loading(t('trade.escrowManager.toastReleasingFunds'), { id: 'release-funds' });
    
    try {
      // Release funds on blockchain
      const txHash = await releaseFunds(trade.trade_id, trade.chain);
      
      toast.loading(t('trade.escrowManager.toastUpdatingStatus'), { id: 'release-funds' });
      
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
      
      toast.success(t('trade.escrowManager.toastReleaseSuccessTitle'), {
        id: 'release-funds',
        description: t('trade.escrowManager.toastReleaseSuccessDesc', {
          amount: trade.amount,
          token: trade.token_symbol
        }),
        duration: 5000,
        action: {
          label: t('trade.escrowManager.viewTx'),
          onClick: () => window.open(`${EXPLORERS[trade.chain]}/tx/${txHash}`, '_blank')
        }
      });
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error releasing funds:', error);
      const errorMsg = error.message || error.reason || t('trade.escrowManager.toastReleaseFailed');
      toast.error(errorMsg, { 
        id: 'release-funds',
        duration: 5000,
        description: t('trade.escrowManager.toastRetrySupport')
      });
    } finally {
      setLoading(false);
    }
  };
  
  const requiredAmount = isSeller
    ? parseFloat(trade.escrow_amount || trade.amount) + parseFloat(bondAmount || 0)
    : 0;
  const hasInsufficientBalance = isSeller && balance && parseFloat(balance) < requiredAmount;
  const principalAmount = parseFloat(trade.amount || 0);
  const escrowAmount = parseFloat(trade.escrow_amount || trade.amount || 0);
  const feePreview = Math.max(0, escrowAmount - principalAmount);
  const sellerBondPreview = parseFloat(bondAmount || 0);
  
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 p-6">
      {/* Status Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Lock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{t('trade.escrowManager.headerTitle')}</h3>
            <p className="text-slate-400 text-xs">{t('trade.escrowManager.headerSubtitle')}</p>
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
            {t('trade.escrowManager.viewTx')}
          </a>
        )}
      </div>
      
      {/* Escrow Details */}
      <div className="space-y-3 mb-6">
        {effectiveStatus === 'pending' && isSeller && (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs text-amber-400 mb-2 font-semibold">⚠️ {t('trade.escrowManager.actionRequired')}</p>
            <p className="text-sm text-white">{t('trade.escrowManager.actionFundEscrow')}</p>
          </div>
        )}
        
        {effectiveStatus === 'funded' && isBuyer && (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs text-blue-400 mb-2 font-semibold">⚠️ {t('trade.escrowManager.actionRequired')}</p>
            <p className="text-sm text-white">{t('trade.escrowManager.actionLockBond')}</p>
          </div>
        )}
        
        {effectiveStatus === 'in_progress' && isSeller && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-xs text-emerald-400 mb-2 font-semibold">⚠️ {t('trade.escrowManager.actionRequired')}</p>
            <p className="text-sm text-white">{t('trade.escrowManager.actionReleaseFunds')}</p>
          </div>
        )}
        
        {balance && (
          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
            <span className="text-slate-400 text-sm">{t('trade.escrowManager.balanceLabel')}</span>
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
                <span className="text-purple-400 text-sm font-medium">{t('trade.escrowManager.bondCreditsLabel')}</span>
              </div>
              <span className="text-white font-semibold">
                {parseFloat(bondCredits).toFixed(4)} {trade.token_symbol}
              </span>
            </div>
            <p className="text-xs text-purple-300 mt-1">
              {t('trade.escrowManager.bondCreditsDesc')}
            </p>
          </div>
        )}
        
        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
          <span className="text-slate-400 text-sm">{t('trade.escrowManager.chainLabel')}</span>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            {trade.chain}
          </Badge>
        </div>
      </div>
      
      {/* Escrow Status Grid */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className={`p-2 rounded-lg border text-center ${
          effectiveStatus === 'funded' || effectiveStatus === 'in_progress' || effectiveStatus === 'completed'
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-slate-800/50 border-slate-700/50'
        }`}>
          <Lock className={`w-4 h-4 mx-auto mb-1 ${
            effectiveStatus === 'funded' || effectiveStatus === 'in_progress' || effectiveStatus === 'completed' ? 'text-emerald-400' : 'text-slate-500'
          }`} />
          <p className="text-xs text-slate-400">{t('trade.escrowManager.sellerBondLabel')}</p>
        </div>
        
        <div className={`p-2 rounded-lg border text-center ${
          effectiveStatus === 'in_progress' || effectiveStatus === 'completed'
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-slate-800/50 border-slate-700/50'
        }`}>
          <Lock className={`w-4 h-4 mx-auto mb-1 ${
            effectiveStatus === 'in_progress' || effectiveStatus === 'completed' ? 'text-emerald-400' : 'text-slate-500'
          }`} />
          <p className="text-xs text-slate-400">{t('trade.escrowManager.buyerBondLabel')}</p>
        </div>
        
        <div className={`p-2 rounded-lg border text-center ${
          effectiveStatus === 'completed'
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-slate-800/50 border-slate-700/50'
        }`}>
          <Unlock className={`w-4 h-4 mx-auto mb-1 ${
            effectiveStatus === 'completed' ? 'text-emerald-400' : 'text-slate-500'
          }`} />
          <p className="text-xs text-slate-400">{t('trade.escrowManager.releasedLabel')}</p>
        </div>
      </div>
      
      {/* Actions */}
      {isSeller && effectiveStatus === 'pending' && (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Funding preview (on-chain)</p>
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Trade amount</span>
              <span className="font-semibold text-white">{principalAmount.toFixed(4)} {trade.token_symbol}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-300 mt-1">
              <span>Platform fees</span>
              <span className="font-semibold text-white">{feePreview.toFixed(4)} {trade.token_symbol}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-300 mt-1">
              <span>Seller DisputeBond</span>
              <span className="font-semibold text-white">{sellerBondPreview.toFixed(4)} {trade.token_symbol}</span>
            </div>
          </div>
          {isFundingExpired && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Funding window expired. Action is blocked.</span>
              </div>
              <p className="text-xs text-red-300 mt-2">
                On expiry, AdBond forfeiture may apply and the Buyer DisputeBond is refundable.
              </p>
            </div>
          )}
          {hasInsufficientBalance && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{t('trade.escrowManager.insufficientFund')}</span>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleFundEscrow}
            disabled={loading || !account || hasInsufficientBalance || isFundingExpired}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('trade.escrowManager.processing')}
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                {t('trade.escrowManager.fundEscrow')}
              </>
            )}
          </Button>
        </div>
      )}
      
      {isBuyer && effectiveStatus === 'funded' && (
        <div className="space-y-3">
          {isConfirmExpired && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirmation window expired. Action is blocked.</span>
              </div>
              <p className="text-xs text-red-300 mt-2">
                Missing the deadline may forfeit the Buyer DisputeBond to the Treasury.
              </p>
            </div>
          )}
          <Button
            onClick={handleConfirmPayment}
            disabled={loading || !account || isConfirmExpired}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('trade.escrowManager.processing')}
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Confirm Payment
              </>
            )}
          </Button>
          <p className="text-xs text-slate-400 text-center">
            Buyer DisputeBond was locked when the Ad was taken.
          </p>
        </div>
      )}
      
      {isSeller && effectiveStatus === 'in_progress' && (
        <div className="space-y-3">
          {isReleaseExpired && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Release window expired. Buyer may open a dispute.</span>
              </div>
              <p className="text-xs text-red-300 mt-2">
                Dispute resolution may forfeit the losing party’s DisputeBond to the Treasury.
              </p>
            </div>
          )}
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-xs text-emerald-300 mb-1">Release is final</p>
            <p className="text-sm text-white">
              Buyer receives crypto, fees go to the treasury, and both bonds are refunded.
            </p>
          </div>
          {!trade.payment_evidence && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{t('trade.escrowManager.waitingPaymentProof')}</span>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleReleaseFunds}
            disabled={loading || !account || !trade.payment_evidence || isReleaseExpired}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('trade.escrowManager.releasing')}
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                {t('trade.escrowManager.releaseFunds')}
              </>
            )}
          </Button>
          
          {trade.payment_evidence && (
            <p className="text-xs text-emerald-400 text-center">
              ✓ {t('trade.escrowManager.paymentProofSubmitted')}
            </p>
          )}
        </div>
      )}
      
      {!account && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-2 text-amber-400 text-sm">
            <Wallet className="w-4 h-4" />
            <span>{t('trade.escrowManager.connectWalletNotice')}</span>
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
              if (isSeller && effectiveStatus === 'pending') handleFundEscrow();
              if (isBuyer && effectiveStatus === 'funded') handleConfirmPayment();
              if (isSeller && effectiveStatus === 'in_progress') handleReleaseFunds();
            }}
            onRefresh={() => {
              setLastError(null);
              window.location.reload();
            }}
          />
        </div>
      )}
      {authModal}
    </Card>
  );
}
