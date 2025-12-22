import { NavLink, Outlet } from "react-router-dom"
import { WalletConnectButton } from "./WalletConnectButton"
import { useIndexerStatus } from "../hooks/escrow"
import { useAccount } from "wagmi"
import { TARGET_CHAIN_ID } from "../lib/config"
import { useAuthContext } from "../context/AuthContext"

const NEUTRAL_LINK = "nav-link"
const ACTIVE_LINK = "nav-link-active"

export const Layout = () => {
  const { data: statuses } = useIndexerStatus()

  // wagmi v3: chainId comes from useAccount
  const { chainId, isConnected } = useAccount()
  const { session } = useAuthContext()

  const networkMismatch =
    Boolean(isConnected && chainId && chainId !== TARGET_CHAIN_ID)

  const syncStatus = statuses?.[0]

  const isArbitrator = session?.roles?.includes("ARBITRATOR")
  const isAdmin = session?.roles?.includes("ADMIN")

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Explore", to: "/explore" },
    ...(isConnected
      ? [
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "My Escrows", to: "/app/escrows" },
          { label: "Create Escrow", to: "/app/create" },
          { label: "Notifications", to: "/app/notifications" },
        ]
      : []),
    ...(isArbitrator ? [{ label: "Arbitration", to: "/arbitrator/disputes" }] : []),
    ...(isAdmin ? [{ label: "Admin", to: "/admin/dashboard" }] : []),
  ]

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-20 glass-bar">
        <div className="page-wrap flex flex-wrap items-center gap-4 py-4">
          <div className="flex-1">
            <NavLink to="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                TF
              </span>
              <span className="text-xl font-bold text-slate-950">Trustfy</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-blue-700">
                Beta
              </span>
            </NavLink>
            <p className="eyebrow">Non-custodial P2P escrow</p>
          </div>

          <nav className="hidden items-center gap-1 rounded-full border border-[color:var(--line)] bg-white/80 px-2 py-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => (isActive ? ACTIVE_LINK : NEUTRAL_LINK)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-outline hidden text-xs uppercase tracking-[0.25em] sm:inline-flex"
              onClick={() => {
                const event = new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: true,
                  bubbles: true,
                })
                document.dispatchEvent(event)
              }}
            >
              Cmd K
            </button>
            <WalletConnectButton />
          </div>
        </div>

        {/* Mobile nav */}
        <div className="page-wrap pb-3 md:hidden">
          <div className="flex items-center gap-2 overflow-x-auto rounded-full border border-[color:var(--line)] bg-white/80 px-2 py-2">
            {navItems.map((item) => (
              <NavLink
                key={`mobile-${item.to}`}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  isActive ? "btn btn-primary text-xs uppercase tracking-[0.3em]" : "btn btn-ghost text-xs uppercase tracking-[0.3em]"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Network mismatch banner */}
        {networkMismatch && (
          <div className="border-t border-[color:var(--line)] bg-[#fff1ea] px-4 py-2 text-xs uppercase tracking-widest text-[#8a3a2e]">
            Switch wallet to chain {TARGET_CHAIN_ID}; current chain {chainId}
          </div>
        )}

        {/* Indexer sync status */}
        {syncStatus && (
          <div className="border-t border-[color:var(--line)] bg-white/80 px-4 py-2 text-[0.7rem] uppercase tracking-[0.35em] text-[color:var(--muted)]">
            <span className="mr-3">Chain {syncStatus.chainId}</span>
            <span className="mr-3 break-all">Contract {syncStatus.contractAddress}</span>
            <span className="mr-3">Synced {syncStatus.lastSyncedBlock}</span>
            <span className="mr-3">Lag {syncStatus.lagBlocks} blocks</span>
            {statuses && statuses.length > 1 && <span>{statuses.length} chains tracked</span>}
          </div>
        )}
      </header>

      <main className="page-wrap flex w-full flex-1 flex-col gap-8 py-8">
        <Outlet />
      </main>

      <footer className="mt-12 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="page-wrap py-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                  TF
                </span>
                <span className="text-xl font-semibold">Trustfy</span>
              </div>
              <p className="mt-3 text-sm text-slate-300">
                Secure P2P escrow on BSC with smart contract protection.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
                Platform
              </h4>
              <div className="mt-3 space-y-2 text-sm text-slate-400">
                <div>Binance Smart Chain</div>
                <div>2% Platform Fee</div>
                <div>24/7 Arbitration</div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
                Legal
              </h4>
              <div className="mt-3 space-y-2 text-sm text-slate-400">
                <NavLink to="/legal/terms" className="hover:text-white">
                  Terms of Service
                </NavLink>
                <NavLink to="/legal/privacy" className="hover:text-white">
                  Privacy Policy
                </NavLink>
                <NavLink to="/legal/faq" className="hover:text-white">
                  FAQ
                </NavLink>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
                Status
              </h4>
              <div className="mt-3 space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span>Operational</span>
                </div>
                <div>BSC Testnet</div>
                <div className="text-xs text-slate-500">Simulation mode</div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-700 pt-6 text-xs text-slate-400 md:flex-row">
            <div>© 2025 Trustfy. All rights reserved.</div>
            <div className="flex items-center gap-2">
              <span>Demo Platform</span>
              <span>•</span>
              <span>Not for Production</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
