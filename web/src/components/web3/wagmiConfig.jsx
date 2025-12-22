import { createConfig, http } from "wagmi";
import { injected, coinbaseWallet } from "wagmi/connectors";
import { bscTestnet, bsc } from "wagmi/chains";
import { getRpcUrl } from "@/lib/config";

const testnetRpc = getRpcUrl(97) ?? bscTestnet.rpcUrls.default.http[0];
const mainnetRpc = getRpcUrl(56) ?? bsc.rpcUrls.default.http[0];

const bscTestnetCustom = {
  ...bscTestnet,
  rpcUrls: {
    ...bscTestnet.rpcUrls,
    default: { http: [testnetRpc] },
    public: { http: [testnetRpc] },
  },
};

const bscMainnetCustom = {
  ...bsc,
  rpcUrls: {
    ...bsc.rpcUrls,
    default: { http: [mainnetRpc] },
    public: { http: [mainnetRpc] },
  },
};

// Define BSC Testnet as primary chain for development
const chains = [bscTestnetCustom, bscMainnetCustom];

// Project metadata - must match your actual domain
const appUrl =
  import.meta.env.VITE_APP_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');

const metadata = {
  name: 'Trustfy',
  description: 'Decentralized Escrow and P2P Trading',
  url: appUrl,
  icons: [`${appUrl}/logo.png`]
};

export const wagmiConfig = createConfig({
  autoConnect: false,
  chains,
  connectors: [
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons?.[0],
    }),
  ],
  transports: {
    [bscTestnetCustom.id]: http(testnetRpc),
    [bscMainnetCustom.id]: http(mainnetRpc),
  },
});

// Initialize Web3Modal with WalletConnect disabled (injected + Coinbase only).
// Chain configurations
export const SUPPORTED_CHAINS = {
  97: {
    id: 97,
    name: 'BSC Testnet',
    network: 'bsc-testnet',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: {
      default: { http: [testnetRpc] },
      public: { http: [testnetRpc] }
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
      default: { http: [mainnetRpc] },
      public: { http: [mainnetRpc] }
    },
    blockExplorers: {
      default: { name: 'BscScan', url: 'https://bscscan.com' }
    }
  }
};

// Target chain for the platform (BSC Testnet for development)
export const TARGET_CHAIN_ID = 97;
export const TARGET_CHAIN = SUPPORTED_CHAINS[TARGET_CHAIN_ID];
