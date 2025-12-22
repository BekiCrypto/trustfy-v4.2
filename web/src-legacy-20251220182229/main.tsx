import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, createConfig } from "wagmi"
import { http } from "@wagmi/core"
import { injected, walletConnect } from "@wagmi/connectors"
import { bsc, bscTestnet } from "viem/chains"
import App from "./App"
import "./index.css"
import { getRpcUrl } from "./lib/config"
import { AuthProvider } from "./context/AuthContext"

const queryClient = new QueryClient()
const supportedChains = [bsc, bscTestnet] as const

const transports = supportedChains.reduce<Record<number, ReturnType<typeof http>>>(
  (acc, chain) => {
    const url = getRpcUrl(chain.id)
    if (url) {
      acc[chain.id] = http(url)
    }
    return acc
  },
  {}
)

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

const connectors = [
  injected(),
  ...(walletConnectProjectId
    ? [
        walletConnect({
          chains: supportedChains,
          projectId: walletConnectProjectId,
          showQrModal: true,
        }),
      ]
    : []),
]

const wagmiConfig = createConfig({
  connectors,
  transports,
  chains: supportedChains,
})

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
)
