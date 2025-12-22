import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { bscTestnet, bsc } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';

// Get WalletConnect Project ID from environment with fallback
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '08b629d82334e760abb14a2b25af1283';

console.log('🔑 WalletConnect Project ID loaded:', projectId ? '✓' : '✗');

// Define BSC Testnet as primary chain for development
const chains = [bscTestnet, bsc];

// Project metadata - must match your actual domain
const metadata = {
  name: 'Trustfy',
  description: 'Decentralized Escrow and P2P Trading',
  url: 'https://trustfy.base44.app',
  icons: ['https://trustfy.base44.app/logo.png']
};

// Wagmi configuration with explicit connectors
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableCoinbase: true,
  enableEmail: false,
  auth: {
    email: false
  }
});

// Create Web3Modal instance with proper configuration
export const web3Modal = createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  defaultChain: bscTestnet,
  themeMode: 'dark',
  metadata,
  themeVariables: {
    '--w3m-font-family': 'Inter, system-ui, sans-serif',
    '--w3m-accent': '#6366f1',
    '--w3m-color-mix': '#1e293b',
    '--w3m-color-mix-strength': 20,
    '--w3m-border-radius-master': '8px'
  },
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX
    '20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66', // TokenPocket
  ],
  includeWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX
    '20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66', // TokenPocket
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    '163d2cf19babf05eb8962e9748f9ebe613ed52ebf9c8107c9a0f104bfcf161b3', // imToken
  ],
  allWallets: 'SHOW',
  enableAnalytics: false,
  enableOnramp: false,
  enableInjected: true,
  enableCoinbase: true
});

// Chain configurations
export const SUPPORTED_CHAINS = {
  97: {
    id: 97,
    name: 'BSC Testnet',
    network: 'bsc-testnet',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://data-seed-prebsc-1-s1.binance.org:8545'] },
      public: { http: ['https://data-seed-prebsc-1-s1.binance.org:8545'] }
    },
    blockExplorers: {
      default: { name: 'BscScan', url: 'https://testnet.bscscan.com' }
    },
    testnet: true
  },
  56: {
    id: 56,
    name: 'BSC Mainnet',
    network: 'bsc',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://bsc-dataseed1.binance.org'] },
      public: { http: ['https://bsc-dataseed1.binance.org'] }
    },
    blockExplorers: {
      default: { name: 'BscScan', url: 'https://bscscan.com' }
    }
  }
};

// Target chain for the platform (BSC Testnet for development)
export const TARGET_CHAIN_ID = 97;
export const TARGET_CHAIN = SUPPORTED_CHAINS[TARGET_CHAIN_ID];