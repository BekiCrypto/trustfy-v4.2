import React, { useEffect } from 'react';
import { useWallet } from './WalletContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import { ESCROW_ABI, CONTRACT_ADDRESSES } from './contractABI';

export default function ContractEventListener({ children }) {
  const { provider, account } = useWallet();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!provider || !account) return;

    const escrowAddress = CONTRACT_ADDRESSES.BSC.escrow;
    if (!escrowAddress || escrowAddress === '0x0000000000000000000000000000000000000000') return;

    const contract = new ethers.Contract(escrowAddress, ESCROW_ABI, provider);

    // EscrowCreated
    const onEscrowCreated = (tradeId, seller, buyer, token, amount, isNative) => {
      if (seller.toLowerCase() === account.toLowerCase() || buyer.toLowerCase() === account.toLowerCase()) {
        toast.success('New escrow created', {
          description: `Trade ${tradeId.substring(0, 8)}...`
        });
        queryClient.invalidateQueries({ queryKey: ['trades'] });
        queryClient.invalidateQueries({ queryKey: ['my-trades'] });
      }
    };

    // EscrowFunded
    const onEscrowFunded = (tradeId, tradeAmount, feeAmount, bondAmount, bondFromCredits, bondFromWallet) => {
      toast.success('Escrow funded', {
        description: `Trade ${tradeId.substring(0, 8)}... - Bond: ${ethers.formatEther(bondFromCredits)} from credits + ${ethers.formatEther(bondFromWallet)} from wallet`
      });
      queryClient.invalidateQueries({ queryKey: ['trade'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    };

    // PaymentConfirmed
    const onPaymentConfirmed = (tradeId, buyer, bondAmount, bondFromCredits, bondFromWallet) => {
      if (buyer.toLowerCase() === account.toLowerCase()) {
        toast.success('Payment confirmed - Buyer bond locked', {
          description: `${ethers.formatEther(bondFromCredits)} from credits + ${ethers.formatEther(bondFromWallet)} from wallet`
        });
      }
      queryClient.invalidateQueries({ queryKey: ['trade'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    };

    // FundsReleased
    const onFundsReleased = (tradeId, recipient, amount) => {
      toast.success('Trade completed!', {
        description: 'Funds released. Both bonds converted to reusable credits!'
      });
      queryClient.invalidateQueries({ queryKey: ['trade'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    };

    // TradeRefunded
    const onTradeRefunded = (tradeId, seller, amount, feesToSeller, bondCredited) => {
      toast.info('Trade refunded', {
        description: `Bond converted to credit: ${ethers.formatEther(bondCredited)}`
      });
      queryClient.invalidateQueries({ queryKey: ['trade'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    };

    // TradeCancelled
    const onTradeCancelled = (tradeId) => {
      toast.info('Trade cancelled');
      queryClient.invalidateQueries({ queryKey: ['trade'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    };

    // DisputeInitiated
    const onDisputeInitiated = (tradeId, initiator, reason) => {
      toast.warning('Dispute initiated', {
        description: reason.substring(0, 50) + '...'
      });
      queryClient.invalidateQueries({ queryKey: ['trade'] });
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
    };

    // DisputeResolved
    const onDisputeResolved = (tradeId, ruling) => {
      const rulingText = ruling === 1 ? 'Buyer wins' : ruling === 2 ? 'Seller wins' : 'Unknown';
      toast.success('Dispute resolved', {
        description: rulingText
      });
      queryClient.invalidateQueries({ queryKey: ['trade'] });
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
    };

    // BondCreditWithdrawn
    const onBondCreditWithdrawn = (user, token, amount) => {
      if (user.toLowerCase() === account.toLowerCase()) {
        toast.success('Bond credits withdrawn', {
          description: `${ethers.formatEther(amount)} transferred to wallet`
        });
      }
    };

    // PlatformProceedsWithdrawn
    const onPlatformProceedsWithdrawn = (token, fees, bondRevenue) => {
      toast.info('Platform proceeds withdrawn', {
        description: `Fees: ${ethers.formatEther(fees)}, Bonds: ${ethers.formatEther(bondRevenue)}`
      });
    };

    // Attach listeners
    contract.on('EscrowCreated', onEscrowCreated);
    contract.on('EscrowFunded', onEscrowFunded);
    contract.on('PaymentConfirmed', onPaymentConfirmed);
    contract.on('FundsReleased', onFundsReleased);
    contract.on('TradeRefunded', onTradeRefunded);
    contract.on('TradeCancelled', onTradeCancelled);
    contract.on('DisputeInitiated', onDisputeInitiated);
    contract.on('DisputeResolved', onDisputeResolved);
    contract.on('BondCreditWithdrawn', onBondCreditWithdrawn);
    contract.on('PlatformProceedsWithdrawn', onPlatformProceedsWithdrawn);

    // Cleanup
    return () => {
      contract.removeAllListeners();
    };
  }, [provider, account, queryClient]);

  return <>{children}</>;
}