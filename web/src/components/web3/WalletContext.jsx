import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { 
  ESCROW_ABI, 
  ERC20_ABI, 
  CONTRACT_ADDRESSES,
  CHAIN_IDS,
  RPC_URLS
} from './contractABI';
import { BEP20Helper } from './BEP20Helper';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async (customProvider = null) => {
    const ethereumProvider = customProvider || window.ethereum;
    
    if (!ethereumProvider) {
      toast.error('No Web3 wallet found. Please install MetaMask or another wallet.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      setIsConnecting(true);
      const web3Provider = new ethers.BrowserProvider(ethereumProvider);
      const accounts = await web3Provider.send('eth_requestAccounts', []);
      const web3Signer = await web3Provider.getSigner();
      const network = await web3Provider.getNetwork();
      
      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      
      // Auto-switch to BSC if not already
      if (Number(network.chainId) !== CHAIN_IDS.BSC) {
        toast.info('Switching to BNB Smart Chain...');
        await switchChain(CHAIN_IDS.BSC);
      } else {
        toast.success('Wallet connected successfully');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    toast.success('Wallet disconnected');
  };

  const switchChain = async (targetChainId = 56) => {
    if (!window.ethereum) return;

    // BSC Only for MVP
    const chainParams = {
      56: {
        chainId: '0x38',
        chainName: 'BNB Smart Chain',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        rpcUrls: ['https://bsc-dataseed1.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com/']
      },
      97: {
        chainId: '0x61',
        chainName: 'BNB Smart Chain Testnet',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
        blockExplorerUrls: ['https://testnet.bscscan.com/']
      }
    };

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainParams[targetChainId].chainId }]
      });
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [chainParams[targetChainId]]
          });
        } catch (addError) {
          toast.error('Failed to add chain');
        }
      } else {
        toast.error('Failed to switch chain');
      }
    }
  };

  // Get contract instance (signer for writes, RPC for reads)
  const getContract = (chain, type = 'escrow') => {
    if (!signer) throw new Error('Wallet not connected');

    const addresses = CONTRACT_ADDRESSES[chain];
    if (!addresses) throw new Error(`Unsupported chain: ${chain}`);

    const address = type === 'escrow' ? addresses.escrow : addresses[type];
    if (!address) throw new Error(`Contract not found: ${type}`);

    const abi = type === 'escrow' ? ESCROW_ABI : ERC20_ABI;
    return new ethers.Contract(address, abi, signer);
  };

  const getReadOnlyContract = (chain, type = 'escrow') => {
    const rpcUrl = RPC_URLS[chain];
    if (!rpcUrl) throw new Error(`RPC not configured for chain: ${chain}`);

    const addresses = CONTRACT_ADDRESSES[chain];
    if (!addresses) throw new Error(`Unsupported chain: ${chain}`);

    const address = type === 'escrow' ? addresses.escrow : addresses[type];
    if (!address) throw new Error(`Contract not found: ${type}`);

    const abi = type === 'escrow' ? ESCROW_ABI : ERC20_ABI;
    const rpcProvider = new ethers.JsonRpcProvider(rpcUrl);
    return new ethers.Contract(address, abi, rpcProvider);
  };

  const getTokenAddressForConfig = (chain, tokenSymbol) => {
    if (!tokenSymbol) return ethers.ZeroAddress;
    if (tokenSymbol === 'BNB' || tokenSymbol === 'MATIC' || tokenSymbol === 'ETH') {
      return ethers.ZeroAddress;
    }
    const tokenAddress = CONTRACT_ADDRESSES[chain]?.[tokenSymbol];
    return tokenAddress ? tokenAddress.toLowerCase() : ethers.ZeroAddress;
  };

  const getTokenConfig = async (chain, tokenSymbol) => {
    try {
      const escrowContract = getReadOnlyContract(chain, 'escrow');
      const tokenAddress = getTokenAddressForConfig(chain, tokenSymbol);
      const cfg = await escrowContract.tokenConfig(tokenAddress);
      return {
        enabled: cfg.enabled,
        makerFeeBps: Number(cfg.makerFeeBps),
        takerFeeBps: Number(cfg.takerFeeBps),
        disputeBondBps: Number(cfg.disputeBondBps),
        adBondBps: Number(cfg.adBondBps),
        sellerFundWindow: Number(cfg.sellerFundWindow),
        buyerConfirmWindow: Number(cfg.buyerConfirmWindow),
        sellerReleaseWindow: Number(cfg.sellerReleaseWindow),
      };
    } catch (error) {
      const errorCode = error?.code;
      if (errorCode !== 'BAD_DATA') {
        console.error('Error getting token config:', error);
      }
      return {
        enabled: false,
        makerFeeBps: 0,
        takerFeeBps: 0,
        disputeBondBps: 0,
        adBondBps: 0,
        sellerFundWindow: 0,
        buyerConfirmWindow: 0,
        sellerReleaseWindow: 0,
        configUnavailable: true,
        error: error?.message ?? 'Token config unavailable',
      };
    }
  };
  
  // Token operations
  const getTokenBalance = async (chain, tokenSymbol) => {
    if (!account || !provider) throw new Error('Wallet not connected');
    
    try {
      const tokenAddress = BEP20Helper.getTokenAddress(tokenSymbol, chain);
      return await BEP20Helper.getBalance(tokenAddress, account, provider);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw error;
    }
  };
  
  const approveToken = async (chain, tokenSymbol, amount) => {
    if (!signer) throw new Error('Wallet not connected');
    
    try {
      const tokenAddress = BEP20Helper.getTokenAddress(tokenSymbol, chain);
      const escrowAddress = CONTRACT_ADDRESSES[chain].escrow;
      
      return await BEP20Helper.approveToken(tokenAddress, escrowAddress, amount, signer);
    } catch (error) {
      console.error('Error approving token:', error);
      throw error;
    }
  };
  
  // Escrow operations
  const fundEscrow = async (tradeId, chain, tokenSymbol, amount, makerFee = 100, takerFee = 150) => {
    if (!signer) throw new Error('Wallet not connected');
    
    try {
      const escrowContract = getContract(chain, 'escrow');
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      
      const isNative = tokenSymbol === 'BNB' || tokenSymbol === 'MATIC' || tokenSymbol === 'ETH';
      
      let tx;
      if (isNative) {
        // For native currency, send value with transaction
        tx = await escrowContract.fundEscrow(tradeId, { value: amountWei });
      } else {
        // For ERC20 tokens, approve first then fund
        const tokenAddress = CONTRACT_ADDRESSES[chain][tokenSymbol];
        const totalAmount = await escrowContract.calculateFees(amountWei, makerFee, takerFee);
        const totalWithAmount = amountWei + totalAmount;
        
        await approveToken(chain, tokenSymbol, ethers.formatUnits(totalWithAmount, 18));
        tx = await escrowContract.fundEscrow(tradeId);
      }
      
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error funding escrow:', error);
      throw error;
    }
  };
  
  const releaseFunds = async (tradeId, chain) => {
    if (!signer) throw new Error('Wallet not connected');
    
    try {
      const escrowContract = getContract(chain, 'escrow');
      const tx = await escrowContract.releaseFunds(tradeId);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error releasing funds:', error);
      throw error;
    }
  };
  
  const createEscrowOnChain = async (tradeId, chain, buyer, tokenSymbol, amount, timeout, makerFee, takerFee) => {
    if (!signer) throw new Error('Wallet not connected');
    
    try {
      const escrowContract = getContract(chain, 'escrow');
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      const isNative = tokenSymbol === 'BNB' || tokenSymbol === 'MATIC' || tokenSymbol === 'ETH';
      const tokenAddress = isNative ? ethers.ZeroAddress : CONTRACT_ADDRESSES[chain][tokenSymbol];
      
      const tx = await escrowContract.createEscrow(
        tradeId,
        buyer,
        tokenAddress,
        amountWei,
        timeout || 86400, // Default 24 hours
        makerFee || 100, // 1% in basis points
        takerFee || 150, // 1.5% in basis points
        isNative
      );
      
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error creating escrow:', error);
      throw error;
    }
  };
  
  const confirmPaymentOnChain = async (tradeId, chain) => {
    if (!signer) throw new Error('Wallet not connected');
    
    try {
      const escrowContract = getContract(chain, 'escrow');
      const tx = await escrowContract.confirmPayment(tradeId);
      
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  };
  
  const refundEscrow = async (tradeId, chain) => {
    if (!signer) throw new Error('Wallet not connected');
    
    try {
      const escrowContract = getContract(chain, 'escrow');
      const tx = await escrowContract.refundIfUnconfirmed(tradeId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error refunding escrow:', error);
      throw error;
    }
  };
  
  const cancelTrade = async (tradeId, chain) => {
    if (!signer) throw new Error('Wallet not connected');
    
    try {
      const escrowContract = getContract(chain, 'escrow');
      const tx = await escrowContract.cancelTrade(tradeId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error cancelling trade:', error);
      throw error;
    }
  };
  
  const initiateDisputeOnChain = async (tradeId, chain, reason) => {
    if (!signer) throw new Error('Wallet not connected');
    
    try {
      const escrowContract = getContract(chain, 'escrow');
      const tx = await escrowContract.initiateDispute(tradeId, reason);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error initiating dispute:', error);
      throw error;
    }
  };
  
  const resolveDisputeOnChain = async (tradeId, chain, ruling) => {
    if (!signer) throw new Error('Wallet not connected');
    
    try {
      const escrowContract = getContract(chain, 'escrow');
      // V2: 0=NONE, 1=BUYER_WINS, 2=SELLER_WINS
      const rulingCode = ruling === 'favor_buyer' ? 1 : ruling === 'favor_seller' ? 2 : 0;
      const tx = await escrowContract.resolveDispute(tradeId, rulingCode);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error resolving dispute:', error);
      throw error;
    }
  };
  
  const getBondAmount = async (chain, amount, tokenSymbol) => {
    try {
      const cfg = await getTokenConfig(chain, tokenSymbol);
      const bps = cfg.disputeBondBps || 0;
      const numericAmount = Number(amount || 0);
      if (!numericAmount || !bps) return '0';
      const bond = (numericAmount * bps) / 10_000;
      return bond.toFixed(8);
    } catch (error) {
      console.error('Error getting bond amount:', error);
      throw error;
    }
  };
  
  // V3 Bond Credit Methods
  const getBondCredits = async (chain, tokenSymbol, userAddress) => {
    if (!provider) return '0';
    
    try {
      const escrowContract = getContract(chain, 'escrow');
      const tokenAddress = BEP20Helper.getTokenAddress(tokenSymbol, chain);
      const creditsWei = await escrowContract.bondCredits(userAddress, tokenAddress);
      return ethers.formatUnits(creditsWei, 18);
    } catch (error) {
      console.error('Error getting bond credits:', error);
      return '0';
    }
  };
  
  const withdrawBondCredit = async (chain, tokenSymbol, amount) => {
    if (!signer) throw new Error('Wallet not connected');
    
    try {
      const escrowContract = getContract(chain, 'escrow');
      const tokenAddress = BEP20Helper.getTokenAddress(tokenSymbol, chain);
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      
      const tx = await escrowContract.withdrawBondCredit(tokenAddress, amountWei);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error withdrawing bond credit:', error);
      throw error;
    }
  };
  
  const getPlatformFeePool = async (chain, tokenSymbol) => {
    if (!provider) throw new Error('Wallet not connected');
    
    try {
      const escrowContract = getContract(chain, 'escrow');
      const tokenAddress = BEP20Helper.getTokenAddress(tokenSymbol, chain);
      const poolWei = await escrowContract.platformFeePool(tokenAddress);
      return ethers.formatUnits(poolWei, 18);
    } catch (error) {
      console.error('Error getting platform fee pool:', error);
      return '0';
    }
  };
  
  const getPlatformBondRevenue = async (chain, tokenSymbol) => {
    if (!provider) throw new Error('Wallet not connected');
    
    try {
      const escrowContract = getContract(chain, 'escrow');
      const tokenAddress = BEP20Helper.getTokenAddress(tokenSymbol, chain);
      const revenueWei = await escrowContract.platformBondRevenue(tokenAddress);
      return ethers.formatUnits(revenueWei, 18);
    } catch (error) {
      console.error('Error getting platform bond revenue:', error);
      return '0';
    }
  };
  
  const withdrawPlatformProceeds = async (chain, tokenSymbol, feeAmount, bondRevenueAmount) => {
    if (!signer) throw new Error('Wallet not connected');
    
    try {
      const escrowContract = getContract(chain, 'escrow');
      const tokenAddress = BEP20Helper.getTokenAddress(tokenSymbol, chain);
      const feeAmountWei = ethers.parseUnits(feeAmount.toString(), 18);
      const bondRevenueWei = ethers.parseUnits(bondRevenueAmount.toString(), 18);
      
      const tx = await escrowContract.withdrawPlatformProceeds(
        tokenAddress, 
        feeAmountWei, 
        bondRevenueWei
      );
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error withdrawing platform proceeds:', error);
      throw error;
    }
  };
  
  const getEscrowStatus = async (tradeId, chain) => {
    try {
      const escrowContract = getReadOnlyContract(chain, 'escrow');
      // Prefer explicit view if available; fallback to public mapping
      if (escrowContract.getEscrowStatus) {
        const [status, amount, expiresAt, seller, buyer, token, isNative, bondAmount, sellerBondLocked, buyerBondLocked] =
          await escrowContract.getEscrowStatus(tradeId);
        return {
          status: Number(status),
          amount: ethers.formatEther(amount),
          expiresAt: new Date(Number(expiresAt) * 1000),
          seller,
          buyer,
          token,
          isNative,
          bondAmount: ethers.formatEther(bondAmount),
          sellerBondLocked,
          buyerBondLocked,
        };
      }

      const escrow = await escrowContract.escrows(tradeId);
      return {
        status: Number(escrow.status),
        amount: ethers.formatEther(escrow.amount),
        feeAmount: ethers.formatEther(escrow.feeAmount),
        buyerDisputeBond: ethers.formatEther(escrow.buyerDisputeBond),
        sellerDisputeBond: ethers.formatEther(escrow.sellerDisputeBond),
        token: escrow.token,
        seller: escrow.seller,
        buyer: escrow.buyer,
        takenAt: Number(escrow.takenAt),
        fundedAt: Number(escrow.fundedAt),
        paymentConfirmedAt: Number(escrow.paymentConfirmedAt),
      };
    } catch (error) {
      console.error('Error getting escrow status:', error);
      throw error;
    }
  };
  
  const signMessage = async (message) => {
    if (!signer) throw new Error('Wallet not connected');
    
    try {
      const signature = await signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        setChainId(parseInt(chainId, 16));
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchChain,
    getTokenBalance,
    getTokenConfig,
    approveToken,
    createEscrowOnChain,
    fundEscrow,
    confirmPaymentOnChain,
    releaseFunds,
    refundEscrow,
    cancelTrade,
    initiateDisputeOnChain,
    resolveDisputeOnChain,
    getEscrowStatus,
    getBondAmount,
    getBondCredits,
    withdrawBondCredit,
    getPlatformFeePool,
    getPlatformBondRevenue,
    withdrawPlatformProceeds,
    signMessage
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
