"use client";

import {useEffect} from 'react';
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "./wagmiConfig";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { bscTestnet } from "wagmi/chains";
import { WalletAuthProvider } from "@/components/auth/WalletAuthProvider";

// ---------------------------------------------
// 1. WalletConnect V2 Project ID (Required)
// ---------------------------------------------
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error(
    "Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable"
  );
}

// ---------------------------------------------
// 2. Initialize Web3Modal Only on Client
// ---------------------------------------------
let web3ModalInitialized = false;

function initializeWeb3Modal() {
  if (web3ModalInitialized) return;
  if (typeof window === "undefined") return;

  createWeb3Modal({
    wagmiConfig,
    projectId,
    chains: [bscTestnet],
    enableAnalytics: false,
    themeVariables: {
      "--w3m-font-family": "Inter, sans-serif",
      "--w3m-accent-color": "#3b82f6",
      "--w3m-background-color": "#0f172a"
    },
    metadata: {
      name: "Trustfy",
      description: "Non-custodial escrow and Prime trading automation",
      url: "https://trustfy.base44.app",
      icons: ["https://trustfy.base44.app/logo.png"]
    }
  });

  web3ModalInitialized = true;
}

// ---------------------------------------------
// 3. Query Client Instance (Created Once)
// ---------------------------------------------
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// ---------------------------------------------
// 4. Safe Console Warning Filter
// ---------------------------------------------
if (typeof window !== "undefined") {
  const original = console.error;
  console.error = (...args) => {
    const msg = args[0]?.toString() || "";
    if (
      msg.includes("WebSocket") ||
      msg.includes("Connection interrupted") ||
      msg.includes("subscribe") ||
      msg.includes("ping timeout")
    ) {
      return;
    }
    original(...args);
  };
}

// ---------------------------------------------
// 5. Exported Provider Stack
// ---------------------------------------------
export function Web3Provider({ children }) {
  useEffect(() => {
    initializeWeb3Modal();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletAuthProvider>
          {children}
        </WalletAuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default Web3Provider;
