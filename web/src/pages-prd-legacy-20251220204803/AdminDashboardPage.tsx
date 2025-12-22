import { Link } from "react-router-dom"
import { useEscrows } from "../hooks/escrow"
import { useQuery } from "@tanstack/react-query"
import { fetchNotificationsHealth } from "../lib/api"

export const AdminDashboardPage = () => {
  const { data } = useEscrows({ page: 1, pageSize: 50 })
  const { data: notificationsHealth } = useQuery({
    queryKey: ["notifications", "health"],
    queryFn: fetchNotificationsHealth,
    staleTime: 60_000,
  })

  const total = data?.meta.total ?? 0
  const resolved = data?.items.filter((escrow) => escrow.state === "RESOLVED").length ?? 0
  const disputed = data?.items.filter((escrow) => escrow.state === "DISPUTED").length ?? 0

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">Admin</p>
        <h1 className="section-title text-slate-950">Admin console</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Platform administration, withdrawals, and role management.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="stat-card hover-lift">
          <p className="eyebrow">Total escrows</p>
          <p className="text-3xl font-semibold text-slate-950">{total}</p>
        </article>
        <article className="stat-card hover-lift">
          <p className="eyebrow">Resolved</p>
          <p className="text-3xl font-semibold text-slate-950">{resolved}</p>
        </article>
        <article className="stat-card hover-lift">
          <p className="eyebrow">Disputed</p>
          <p className="text-3xl font-semibold text-slate-950">{disputed}</p>
        </article>
      </div>

      <div className="card p-5">
        <p className="eyebrow">Notifications</p>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Service status: {notificationsHealth?.status ?? "unknown"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/admin/pools"
          className="card-soft hover-lift p-5 text-sm text-[color:var(--muted)]"
        >
          <p className="eyebrow">Pool management</p>
          <p className="text-2xl font-semibold text-slate-950">Withdraw fees & bonds</p>
          <p className="mt-2 text-xs text-[color:var(--muted)]">
            On-chain withdrawals executed by admin wallet.
          </p>
        </Link>
        <Link
          to="/admin/roles"
          className="card-soft hover-lift p-5 text-sm text-[color:var(--muted)]"
        >
          <p className="eyebrow">Role allowlists</p>
          <p className="text-2xl font-semibold text-slate-950">Admins · Arbitrators</p>
          <p className="mt-2 text-xs text-[color:var(--muted)]">
            Grant privileged access to trusted wallets.
          </p>
        </Link>
        <Link
          to="/admin/tokens"
          className="card-soft hover-lift p-5 text-sm text-[color:var(--muted)]"
        >
          <p className="eyebrow">Token registry</p>
          <p className="text-2xl font-semibold text-slate-950">TokenKey metadata</p>
          <p className="mt-2 text-xs text-[color:var(--muted)]">
            Configure tokens for UI and contract flows.
          </p>
        </Link>
      </div>
    </section>
  )
}
