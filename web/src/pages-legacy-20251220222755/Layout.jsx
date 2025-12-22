import { Link } from "react-router-dom";
import { useAccount, useDisconnect } from "wagmi";
import {
  Shield,
  LayoutDashboard,
  Store,
  Scale,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import Web3Provider from "@/components/web3/Web3Provider";
import { WalletProvider } from "@/components/web3/WalletContext";
import WalletButtonV2 from "@/components/web3/WalletButtonV2";
import { useAuthContext } from "@/context/AuthContext";

const navItemBase = "nav-link inline-flex items-center gap-2";

export default function Layout({ children, currentPageName }) {
  return (
    <Web3Provider>
      <WalletProvider>
        <LayoutShell currentPageName={currentPageName}>{children}</LayoutShell>
      </WalletProvider>
    </Web3Provider>
  );
}

function LayoutShell({ children, currentPageName }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { session, logout } = useAuthContext();

  const roles = session?.roles ?? [];
  const isArbitrator = roles.includes("ARBITRATOR");
  const isAdmin = roles.includes("ADMIN");

  const navItems = [
    { label: "Home", href: "/home" },
    { label: "Marketplace", href: "/marketplace", icon: Store },
    ...(isConnected
      ? [
          { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { label: "Trades", href: "/trades", icon: Scale },
          { label: "Create", href: "/create", icon: Store },
          { label: "Alerts", href: "/notifications", icon: Shield },
        ]
      : []),
    ...(isArbitrator ? [{ label: "Arbitration", href: "/disputes", icon: Scale }] : []),
    ...(isAdmin ? [{ label: "Admin", href: "/admin", icon: Shield }] : []),
    ...(isConnected ? [{ label: "Profile", href: "/profile", icon: User }] : []),
    ...(isConnected ? [{ label: "Settings", href: "/settings", icon: Settings }] : []),
  ];

  const handleLogout = async () => {
    await logout();
    disconnect();
  };

  return (
    <div className="app-shell">
      <header className="glass-bar sticky top-0 z-50">
        <div className="page-wrap flex items-center justify-between py-4">
          <Link to="/home" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-[color:var(--ink)]">Trustfy</p>
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                P2P Escrow
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentPageName?.toLowerCase() === item.label.toLowerCase();
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`${navItemBase} ${isActive ? "nav-link-active" : ""}`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <WalletButtonV2 />
            {isConnected && session && (
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline text-xs uppercase tracking-[0.2em]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="page-wrap py-10">{children}</main>

      <footer className="mt-16 border-t border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="page-wrap grid gap-8 py-12 md:grid-cols-3">
          <div>
            <p className="text-lg font-semibold text-[color:var(--ink)]">Trustfy</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Non-custodial escrow for secure P2P trading on BSC.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
              Platform
            </p>
            <div className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
              <p>Binance Smart Chain</p>
              <p>2% Platform Fee</p>
              <p>Arbitration Ready</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
              Legal
            </p>
            <div className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
              <Link to="/docs" className="hover:text-[color:var(--ink)]">
                Documentation
              </Link>
              <Link to="/Safety" className="hover:text-[color:var(--ink)]">
                Safety & Compliance
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
