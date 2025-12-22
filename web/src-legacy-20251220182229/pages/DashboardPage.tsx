import { useMemo } from "react"
import { ESCROW_STATES, type EscrowState } from "@trustfy/shared"
import { useEscrows } from "../hooks/escrow"
import { useNotificationPreferences } from "../hooks/notifications"
import { Link } from "react-router-dom"
import { useAuthContext } from "../context/AuthContext"

const statesToShow = ESCROW_STATES.filter((state) => state !== "CANCELLED")

export const DashboardPage = () => {
  const { data, isLoading } = useEscrows({ page: 1, pageSize: 50 })
  const { data: notificationPrefs } = useNotificationPreferences()
  const { session } = useAuthContext()
  const roles = session?.roles ?? []
  const isArbitrator = roles.includes("ARBITRATOR")
  const isAdmin = roles.includes("ADMIN")

  const totals = useMemo(() => {
    const initial = ESCROW_STATES.reduce<Record<EscrowState, number>>(
      (acc, state) => ({ ...acc, [state]: 0 }),
      {} as Record<EscrowState, number>
    )
    data?.items.forEach((escrow) => {
      const state = escrow.state as EscrowState
      if (state in initial) {
        initial[state] = (initial[state] ?? 0) + 1
      }
    })
    return initial
  }, [data])

  const activeCount =
    (totals.CREATED ?? 0) +
    (totals.TAKEN ?? 0) +
    (totals.FUNDED ?? 0) +
    (totals.PAYMENT_CONFIRMED ?? 0)

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">Dashboard</p>
        <h1 className="section-title text-slate-950">Your role-aware insights</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Live metrics from indexed escrow state and activity.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="stat-card hover-lift">
          <p className="eyebrow">Total escrows</p>
          <p className="text-4xl font-semibold text-slate-950">
            {data?.meta.total ?? 0}
          </p>
          <p className="text-xs text-[color:var(--muted)]">Last 50 records</p>
        </article>
        <article className="stat-card hover-lift">
          <p className="eyebrow">Active</p>
          <p className="text-3xl font-semibold text-slate-950">{activeCount}</p>
          <p className="text-xs text-[color:var(--muted)]">Open flows</p>
        </article>
        <article className="stat-card hover-lift">
          <p className="eyebrow">Resolved</p>
          <p className="text-3xl font-semibold text-slate-950">
            {totals.RESOLVED ?? 0}
          </p>
          <p className="text-xs text-[color:var(--muted)]">Completed</p>
        </article>
        <article className="stat-card hover-lift">
          <p className="eyebrow">Disputed</p>
          <p className="text-3xl font-semibold text-slate-950">
            {totals.DISPUTED ?? 0}
          </p>
          <p className="text-xs text-[color:var(--muted)]">Open cases</p>
        </article>
      </div>

      <div className="card p-5">
        <p className="eyebrow">State distribution</p>
        <div className="grid gap-3 pt-4 md:grid-cols-3">
          {statesToShow.map((state) => (
            <div key={state} className="card-soft hover-lift p-3 text-sm">
              <p className="eyebrow">{state}</p>
              <p className="text-2xl font-semibold text-slate-950">
                {totals[state]}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <p className="eyebrow">Notifications</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-950">Delivery preferences</p>
            <p className="text-xs text-[color:var(--muted)]">
              {notificationPrefs
                ? "Configured channels are active."
                : "No notification channels configured yet."}
            </p>
          </div>
          <Link to="/app/notifications" className="btn btn-outline text-xs uppercase tracking-[0.3em]">
            Manage
          </Link>
        </div>
      </div>

      <div className="card p-5">
        <p className="eyebrow">Quick actions</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/app/create" className="btn btn-primary text-xs uppercase tracking-[0.3em]">
            Create Escrow
          </Link>
          <Link to="/app/escrows" className="btn btn-outline text-xs uppercase tracking-[0.3em]">
            My Escrows
          </Link>
          <Link to="/explore" className="btn btn-outline text-xs uppercase tracking-[0.3em]">
            Explore
          </Link>
          {isArbitrator && (
            <Link to="/arbitrator/disputes" className="btn btn-outline text-xs uppercase tracking-[0.3em]">
              Arbitration
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/dashboard" className="btn btn-outline text-xs uppercase tracking-[0.3em]">
              Admin Console
            </Link>
          )}
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-[color:var(--muted)]">Fresh data will appear soon.</p>
      )}
    </section>
  )
}
