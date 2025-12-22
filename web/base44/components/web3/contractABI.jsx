// Smart Contract ABIs for P2P Escrow Platform - V3
// Deployed Contract: 0x79DA3a1E93fDEB9C99A840009ec184132e74Ad79 (BSC Testnet)

export const ESCROW_ABI = [
  // View functions
  {
    "inputs": [
      {"internalType": "string", "name": "tradeId", "type": "string"}
    ],
    "name": "getEscrowStatus",
    "outputs": [
      {"internalType": "enum TrustfyEscrowV3.EscrowStatus", "name": "status", "type": "uint8"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "expiresAt", "type": "uint256"},
      {"internalType": "address", "name": "seller", "type": "address"},
      {"internalType": "address", "name": "buyer", "type": "address"},
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "bool", "name": "isNative", "type": "bool"},
      {"internalType": "uint256", "name": "bondAmount", "type": "uint256"},
      {"internalType": "bool", "name": "sellerBondLocked", "type": "bool"},
      {"internalType": "bool", "name": "buyerBondLocked", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "address", "name": "token", "type": "address"}
    ],
    "name": "bondCredits",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "token", "type": "address"}
    ],
    "name": "bondWithdrawalThreshold",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "token", "type": "address"}
    ],
    "name": "platformFeePool",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "token", "type": "address"}
    ],
    "name": "platformBondRevenue",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "getBondAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "makerFeeBps", "type": "uint256"},
      {"internalType": "uint256", "name": "takerFeeBps", "type": "uint256"}
    ],
    "name": "calculateFees",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
  },
  // State-changing functions
  {
    "inputs": [
      {"internalType": "string", "name": "tradeId", "type": "string"},
      {"internalType": "address", "name": "buyer", "type": "address"},
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "timeout", "type": "uint256"},
      {"internalType": "uint256", "name": "makerFeeBps", "type": "uint256"},
      {"internalType": "uint256", "name": "takerFeeBps", "type": "uint256"},
      {"internalType": "bool", "name": "isNative", "type": "bool"}
    ],
    "name": "createEscrow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "tradeId", "type": "string"}],
    "name": "fundEscrow",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "tradeId", "type": "string"}],
    "name": "confirmPayment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "tradeId", "type": "string"}],
    "name": "releaseFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "tradeId", "type": "string"},
      {"internalType": "string", "name": "reason", "type": "string"}
    ],
    "name": "initiateDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "tradeId", "type": "string"},
      {"internalType": "uint8", "name": "ruling", "type": "uint8"}
    ],
    "name": "resolveDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "tradeId", "type": "string"}],
    "name": "refundIfUnconfirmed",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "tradeId", "type": "string"}],
    "name": "cancelTrade",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Bond management functions
  {
    "inputs": [
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "withdrawBondCredit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Admin/Access Control functions
  {
    "inputs": [
      {"internalType": "uint16", "name": "_bondBps", "type": "uint16"},
      {"internalType": "uint256", "name": "_minBond", "type": "uint256"}
    ],
    "name": "setBondConfig",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "threshold", "type": "uint256"}
    ],
    "name": "setBondWithdrawalThreshold",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "feeAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "bondRevenueAmount", "type": "uint256"}
    ],
    "name": "withdrawPlatformProceeds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "role", "type": "bytes32"},
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "role", "type": "bytes32"},
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ARBITRATOR_ROLE",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "string", "name": "tradeId", "type": "string"},
      {"indexed": true, "internalType": "address", "name": "seller", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "token", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "bool", "name": "isNative", "type": "bool"}
    ],
    "name": "EscrowCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "string", "name": "tradeId", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "tradeAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "feeAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "bondAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "bondFromCredits", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "bondFromWallet", "type": "uint256"}
    ],
    "name": "EscrowFunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "string", "name": "tradeId", "type": "string"},
      {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "bondAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "bondFromCredits", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "bondFromWallet", "type": "uint256"}
    ],
    "name": "PaymentConfirmed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "string", "name": "tradeId", "type": "string"},
      {"indexed": true, "internalType": "address", "name": "recipient", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "FundsReleased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "string", "name": "tradeId", "type": "string"},
      {"indexed": true, "internalType": "address", "name": "seller", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "feesToSeller", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "bondCredited", "type": "uint256"}
    ],
    "name": "TradeRefunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "string", "name": "tradeId", "type": "string"}
    ],
    "name": "TradeCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "string", "name": "tradeId", "type": "string"},
      {"indexed": true, "internalType": "address", "name": "initiator", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "reason", "type": "string"}
    ],
    "name": "DisputeInitiated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "string", "name": "tradeId", "type": "string"},
      {"indexed": false, "internalType": "uint8", "name": "ruling", "type": "uint8"}
    ],
    "name": "DisputeResolved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "token", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "BondCreditWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "token", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "fees", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "bondRevenue", "type": "uint256"}
    ],
    "name": "PlatformProceedsWithdrawn",
    "type": "event"
  }
];

export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  }
];

// BEP20 Token Contract Addresses on BSC
// TrustfyEscrowV3 deployed on BSC Testnet
export const CONTRACT_ADDRESSES = {
  BSC: {
    escrow: "0x79DA3a1E93fDEB9C99A840009ec184132e74Ad79", // ✅ TrustfyEscrowV3 (BSC Testnet)
    // BEP20 Token Addresses (BSC Testnet)
    USDT: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // Tether USD (Testnet)
    USDC: "0x64544969ed7EBf5f083679233325356EbE738930", // USD Coin (Testnet)
    BUSD: "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee", // Binance USD (Testnet)
    BNB: "0x0000000000000000000000000000000000000000"  // Native BNB
  }
};

// BSC Configuration - Using Testnet for V3
export const CHAIN_IDS = {
  BSC: 97, // Currently using Testnet
  BSC_TESTNET: 97,
  BSC_MAINNET: 56
};

export const RPC_URLS = {
  BSC: "https://data-seed-prebsc-1-s1.binance.org:8545", // Testnet
  BSC_TESTNET: "https://data-seed-prebsc-1-s1.binance.org:8545",
  BSC_MAINNET: "https://bsc-dataseed1.binance.org"
};

export const EXPLORERS = {
  BSC: "https://testnet.bscscan.com", // Testnet
  BSC_TESTNET: "https://testnet.bscscan.com",
  BSC_MAINNET: "https://bscscan.com"
};

// Supported BEP20 tokens
export const SUPPORTED_TOKENS = ['USDT', 'USDC', 'BUSD', 'BNB'];