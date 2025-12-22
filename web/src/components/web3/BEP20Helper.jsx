import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, ERC20_ABI } from './contractABI';

/**
 * BEP20 Token Helper Functions
 * Utilities for interacting with BEP20 tokens on BSC
 */

export const BEP20Helper = {
  /**
   * Get token decimals
   */
  getDecimals: async (tokenAddress, provider) => {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      return await contract.decimals();
    } catch {
      return 18; // Default to 18 decimals
    }
  },

  /**
   * Get token balance with proper decimals
   */
  getBalance: async (tokenAddress, walletAddress, provider) => {
    try {
      if (tokenAddress === ethers.ZeroAddress) {
        // Native BNB
        const balance = await provider.getBalance(walletAddress);
        return ethers.formatEther(balance);
      } else {
        // BEP20 Token
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance = await contract.balanceOf(walletAddress);
        const decimals = await BEP20Helper.getDecimals(tokenAddress, provider);
        return ethers.formatUnits(balance, decimals);
      }
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  },

  /**
   * Get token allowance
   */
  getAllowance: async (tokenAddress, walletAddress, spenderAddress, provider) => {
    try {
      if (tokenAddress === ethers.ZeroAddress) return ethers.MaxUint256; // Native BNB doesn't need approval
      
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const allowance = await contract.allowance(walletAddress, spenderAddress);
      const decimals = await BEP20Helper.getDecimals(tokenAddress, provider);
      return ethers.formatUnits(allowance, decimals);
    } catch (error) {
      console.error('Error getting allowance:', error);
      throw error;
    }
  },

  /**
   * Approve token spending
   */
  approveToken: async (tokenAddress, spenderAddress, amount, signer) => {
    try {
      if (tokenAddress === ethers.ZeroAddress) return null; // Native BNB doesn't need approval
      
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const decimals = await BEP20Helper.getDecimals(tokenAddress, signer.provider);
      const amountWei = ethers.parseUnits(amount.toString(), decimals);
      
      const tx = await contract.approve(spenderAddress, amountWei);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error approving token:', error);
      throw error;
    }
  },

  /**
   * Get token info (name, symbol, decimals)
   */
  getTokenInfo: async (tokenAddress, provider) => {
    try {
      if (tokenAddress === ethers.ZeroAddress) {
        return {
          name: 'Binance Coin',
          symbol: 'BNB',
          decimals: 18
        };
      }

      const contract = new ethers.Contract(tokenAddress, [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)'
      ], provider);

      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals()
      ]);

      return { name, symbol, decimals };
    } catch (error) {
      console.error('Error getting token info:', error);
      throw error;
    }
  },

  /**
   * Format token amount for display
   */
  formatAmount: (amount, decimals = 18, maxDecimals = 6) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0';
    
    // For very small amounts, show more decimals
    if (num < 0.01) return num.toFixed(Math.min(decimals, 8));
    
    // For normal amounts, limit to maxDecimals
    return num.toFixed(maxDecimals).replace(/\.?0+$/, '');
  },

  /**
   * Get token address by symbol
   */
  getTokenAddress: (symbol, chain = 'BSC') => {
    return CONTRACT_ADDRESSES[chain]?.[symbol] || ethers.ZeroAddress;
  },

  /**
   * Check if address is valid
   */
  isValidAddress: (address) => {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  },

  /**
   * Validate sufficient balance and allowance
   */
  validateBalanceAndAllowance: async (tokenAddress, walletAddress, spenderAddress, requiredAmount, provider) => {
    try {
      const balance = await BEP20Helper.getBalance(tokenAddress, walletAddress, provider);
      const balanceNum = parseFloat(balance);
      const requiredNum = parseFloat(requiredAmount);

      if (balanceNum < requiredNum) {
        return {
          valid: false,
          error: 'Insufficient balance',
          balance: balanceNum,
          required: requiredNum
        };
      }

      if (tokenAddress !== ethers.ZeroAddress) {
        const allowance = await BEP20Helper.getAllowance(tokenAddress, walletAddress, spenderAddress, provider);
        const allowanceNum = parseFloat(allowance);

        if (allowanceNum < requiredNum) {
          return {
            valid: false,
            error: 'Insufficient allowance',
            needsApproval: true,
            allowance: allowanceNum,
            required: requiredNum
          };
        }
      }

      return { valid: true };

    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
};