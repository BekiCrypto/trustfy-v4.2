import { useAccount, usePublicClient, useWalletClient, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseUnits, formatUnits, getAddress } from 'viem';
import { toast } from 'sonner';
import { ERC20_ABI } from './contractABI';
import { escrowAbi, selectEscrowAddress } from '../../lib/contract';

const useEscrowAddress = () => {
  const chainId = useChainId();
  return selectEscrowAddress(chainId);
};

/**
 * Custom hook for interacting with TrustfyEscrowV3 contract
 */
export function useEscrowContract() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  const escrowAddress = useEscrowAddress();

  /**
   * Create escrow on-chain
   */
  const createEscrow = async (tradeId, buyer, tokenAddress, amount, timeout, makerFeeBps, takerFeeBps, isNative) => {
    try {
      if (!escrowAddress) throw new Error('Contract not configured for current chain');
      const amountWei = parseUnits(amount.toString(), 18);
      
      const hash = await writeContractAsync({
        address: escrowAddress,
        abi: escrowAbi,
        functionName: 'createEscrow',
        args: [tradeId, buyer, tokenAddress, amountWei, timeout, makerFeeBps, takerFeeBps, isNative]
      });

      toast.success('Escrow created! Waiting for confirmation...');
      return hash;
    } catch (error) {
      console.error('Create escrow error:', error);
      handleContractError(error);
      throw error;
    }
  };

  /**
   * Fund escrow (seller deposits funds + fees + bond)
   */
  const fundEscrow = async (tradeId, isNative, amount) => {
    try {
      if (!escrowAddress) throw new Error('Contract not configured for current chain');
      const hash = await writeContractAsync({
        address: escrowAddress,
        abi: escrowAbi,
        functionName: 'fundEscrow',
        args: [tradeId],
        value: isNative ? parseUnits(amount.toString(), 18) : undefined
      });

      toast.success('Funding escrow! Waiting for confirmation...');
      return hash;
    } catch (error) {
      console.error('Fund escrow error:', error);
      handleContractError(error);
      throw error;
    }
  };

  /**
   * Confirm payment (buyer locks bond)
   */
  const confirmPayment = async (tradeId, isNative, bondAmount) => {
    try {
      if (!escrowAddress) throw new Error('Contract not configured for current chain');
      const hash = await writeContractAsync({
        address: escrowAddress,
        abi: escrowAbi,
        functionName: 'confirmPayment',
        args: [tradeId],
        value: isNative ? parseUnits(bondAmount.toString(), 18) : undefined
      });

      toast.success('Payment confirmed! Waiting for confirmation...');
      return hash;
    } catch (error) {
      console.error('Confirm payment error:', error);
      handleContractError(error);
      throw error;
    }
  };

  /**
   * Release funds to buyer
   */
  const releaseFunds = async (tradeId) => {
    try {
      if (!escrowAddress) throw new Error('Contract not configured for current chain');
      const hash = await writeContractAsync({
        address: escrowAddress,
        abi: escrowAbi,
        functionName: 'releaseFunds',
        args: [tradeId]
      });

      toast.success('Releasing funds! Waiting for confirmation...');
      return hash;
    } catch (error) {
      console.error('Release funds error:', error);
      handleContractError(error);
      throw error;
    }
  };

  /**
   * Refund if payment not confirmed
   */
  const refundIfUnconfirmed = async (tradeId) => {
    try {
      if (!escrowAddress) throw new Error('Contract not configured for current chain');
      const hash = await writeContractAsync({
        address: escrowAddress,
        abi: escrowAbi,
        functionName: 'refundIfUnconfirmed',
        args: [tradeId]
      });

      toast.success('Processing refund! Waiting for confirmation...');
      return hash;
    } catch (error) {
      console.error('Refund error:', error);
      handleContractError(error);
      throw error;
    }
  };

  /**
   * Initiate dispute
   */
  const initiateDispute = async (tradeId, reason) => {
    try {
      if (!escrowAddress) throw new Error('Contract not configured for current chain');
      const hash = await writeContractAsync({
        address: escrowAddress,
        abi: escrowAbi,
        functionName: 'initiateDispute',
        args: [tradeId, reason]
      });

      toast.success('Dispute initiated! Waiting for confirmation...');
      return hash;
    } catch (error) {
      console.error('Initiate dispute error:', error);
      handleContractError(error);
      throw error;
    }
  };

  /**
   * Resolve dispute (arbitrator only)
   */
  const resolveDispute = async (tradeId, ruling) => {
    try {
      if (!escrowAddress) throw new Error('Contract not configured for current chain');
      // ruling: 0=NONE, 1=BUYER_WINS, 2=SELLER_WINS
      const rulingCode = ruling === 'favor_buyer' ? 1 : ruling === 'favor_seller' ? 2 : 0;
      
      const hash = await writeContractAsync({
        address: escrowAddress,
        abi: escrowAbi,
        functionName: 'resolveDispute',
        args: [tradeId, rulingCode]
      });

      toast.success('Dispute resolved! Waiting for confirmation...');
      return hash;
    } catch (error) {
      console.error('Resolve dispute error:', error);
      handleContractError(error);
      throw error;
    }
  };

  /**
   * Withdraw bond credits
   */
  const withdrawBondCredit = async (tokenAddress, amount) => {
    try {
      if (!escrowAddress) throw new Error('Contract not configured for current chain');
      const amountWei = parseUnits(amount.toString(), 18);
      
      const hash = await writeContractAsync({
        address: escrowAddress,
        abi: escrowAbi,
        functionName: 'withdrawBondCredit',
        args: [tokenAddress, amountWei]
      });

      toast.success('Withdrawing bond credit! Waiting for confirmation...');
      return hash;
    } catch (error) {
      console.error('Withdraw bond credit error:', error);
      handleContractError(error);
      throw error;
    }
  };

  return {
    createEscrow,
    fundEscrow,
    confirmPayment,
    releaseFunds,
    refundIfUnconfirmed,
    initiateDispute,
    resolveDispute,
    withdrawBondCredit
  };
}

/**
 * Hook to read contract data
 */
export function useEscrowData(tradeId) {
  const escrowAddress = useEscrowAddress();
  const { data: escrowStatus, isLoading, refetch } = useReadContract({
    address: escrowAddress,
    abi: escrowAbi,
    functionName: 'getEscrowStatus',
    args: tradeId ? [tradeId] : undefined,
    enabled: !!tradeId && !!escrowAddress
  });

  return {
    escrowStatus,
    isLoading,
    refetch
  };
}

/**
 * Hook to read bond credits
 */
export function useBondCredits(userAddress, tokenAddress) {
  const escrowAddress = useEscrowAddress();
  const { data: bondCredits, isLoading, refetch } = useReadContract({
    address: escrowAddress,
    abi: escrowAbi,
    functionName: 'bondCredits',
    args: userAddress && tokenAddress ? [userAddress, tokenAddress] : undefined,
    enabled: !!(userAddress && tokenAddress && escrowAddress)
  });

  return {
    bondCredits: bondCredits ? formatUnits(bondCredits, 18) : '0',
    isLoading,
    refetch
  };
}

/**
 * Hook to read platform fee pool
 */
export function usePlatformFeePool(tokenAddress) {
  const escrowAddress = useEscrowAddress();
  const { data: feePool, isLoading } = useReadContract({
    address: escrowAddress,
    abi: escrowAbi,
    functionName: 'platformFeePool',
    args: tokenAddress ? [tokenAddress] : undefined,
    enabled: !!tokenAddress && !!escrowAddress
  });

  return {
    feePool: feePool ? formatUnits(feePool, 18) : '0',
    isLoading
  };
}

/**
 * Hook for ERC20 token operations
 */
export function useTokenOperations() {
  const { writeContractAsync } = useWriteContract();

  const approveToken = async (tokenAddress, spenderAddress, amount) => {
    try {
      const amountWei = parseUnits(amount.toString(), 18);
      
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spenderAddress, amountWei]
      });

      toast.info('Approving token... Please wait for confirmation');
      return hash;
    } catch (error) {
      console.error('Approve token error:', error);
      handleContractError(error);
      throw error;
    }
  };

  return { approveToken };
}

/**
 * Error handler for contract interactions
 */
function handleContractError(error) {
  if (error.message?.includes('User rejected')) {
    toast.error('Transaction rejected by user');
  } else if (error.message?.includes('insufficient funds')) {
    toast.error('Insufficient funds for gas');
  } else if (error.message?.includes('execution reverted')) {
    toast.error('Transaction failed: ' + (error.shortMessage || 'Contract execution reverted'));
  } else {
    toast.error(error.shortMessage || error.message || 'Transaction failed');
  }
}
