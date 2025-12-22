import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ESCROW_STATES, type EscrowState } from "@trustfy/shared"
import { useEscrows } from "../hooks/escrow"
import { StateBadge } from "../components/StateBadge"
import { useAccount } from "wagmi"

const statuses = ESCROW_STATES

const labelForState = (state: EscrowState) => {
  switch (state) {
    case "CREATED":
      return "Waiting for Buyer"
    case "TAKEN":
      return "Awaiting Funding"
    case "FUNDED":
      return "Seller Funded"
    case "PAYMENT_CONFIRMED":
      return "Awaiting Release"
    case "DISPUTED":
      return "In Dispute"
    case "RESOLVED":
      return "Resolved"
    case "CANCELLED":
      return "Cancelled"
  }
}

export const ExplorePage = () => {
  const [statusFilter, setStatusFilter] = useState<EscrowState | "">("")
  const [search, setSearch] = useState("")
  const [tokenFilter, setTokenFilter] = useState("")
  const { isConnected } = useAccount()
  const effectiveStatus = isConnected ? statusFilter || undefined : "CREATED"
  const { data, isLoading } = useEscrows({
    status: effectiveStatus,
    tokenKey: tokenFilter || undefined,
    page: 1,
    pageSize: 36,
  })

  const totalByState = useMemo(() => {
    const map: Record<string, number> = {}
    data?.items.forEach((escrow) => {
      map[escrow.state] = (map[escrow.state] ?? 0) + 1
    })
    return map
  }, [data])

  const statusesToDisplay = isConnected ? statuses : (["CREATED"] as const)

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return data?.items ?? []
    return (data?.items ?? []).filter((escrow) =>
      [escrow.escrowId, escrow.seller, escrow.buyer]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(needle))
    )
  }, [data, search])

  const tokenKeys = useMemo(() => {
    const unique = new Set<string>()
    data?.items.forEach((escrow) => {
      if (escrow.tokenKey) unique.add(escrow.tokenKey)
    })
    return Array.from(unique)
  }, [data])

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <div>
          <p className="eyebrow">Explore</p>
          <h1 className="section-title text-slate-950">Escrows across BSC</h1>
          <p className="text-sm text-[color:var(--muted)]">
            Browse open escrows and track state transitions in real time.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="input"
            placeholder="Search by escrowId or wallet address"
          />
          <div className="flex flex-wrap items-center gap-2 rounded-full border border-[color:var(--line)] bg-white/70 px-2 py-2">
            {isConnected ? (
              <>
                <button
                  onClick={() => setStatusFilter("")}
                  className={`btn text-[0.65rem] uppercase tracking-[0.3em] ${
                    statusFilter === "" ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  All
                </button>
                {statuses.map((state) => (
                  <button
                    key={state}
                    onClick={() => setStatusFilter(state)}
                    className={`btn text-[0.65rem] uppercase tracking-[0.3em] ${
                      statusFilter === state ? "btn-primary" : "btn-ghost"
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </>
            ) : (
              <span className="badge-soft">Public ads only · CREATED</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs uppercase tracking-[0.25em] text-[color:var(--muted)]">
            TokenKey
          </label>
          <select
            className="input w-full md:w-[320px]"
            value={tokenFilter}
            onChange={(event) => setTokenFilter(event.target.value)}
            disabled={!isConnected}
          >
            <option value="">All tokens</option>
            {tokenKeys.map((tokenKey) => (
              <option key={tokenKey} value={tokenKey}>
                {tokenKey}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {statusesToDisplay.map((state) => (
          <div key={state} className="stat-card hover-lift">
            <p className="eyebrow">{state}</p>
            <p className="text-3xl font-semibold text-slate-950">
              {totalByState[state] ?? 0}
            </p>
            <p className="text-xs text-[color:var(--muted)]">
              {labelForState(state)}
            </p>
          </div>
        ))}
      </div>

      {!isConnected && (
        <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-4 text-center text-xs text-[color:var(--muted)]">
          Connect your wallet to view TAKEN, FUNDED, DISPUTED, and RESOLVED escrows.
        </div>
      )}

      <div className="space-y-4">
        {isLoading && (
          <p className="text-sm text-[color:var(--muted)]">Loading escrows…</p>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-6 text-center text-sm text-[color:var(--muted)]">
            No escrows match the current filters.
          </div>
        )}
        {filtered.map((escrow) => (
          <article
            key={escrow.escrowId}
            className="card-soft hover-lift p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Escrow</p>
                <h2 className="text-lg font-semibold text-slate-950">
                  {escrow.escrowId.slice(2, 10)}
                </h2>
                <p className="text-sm text-[color:var(--muted)]">
                  {labelForState(escrow.state as EscrowState)}
                </p>
              </div>
              <StateBadge state={escrow.state} />
            </div>
            <div className="mt-4 grid gap-2 text-sm text-[color:var(--muted)] md:grid-cols-3">
              <span>
                Seller{" "}
                {isConnected
                  ? escrow.seller
                  : `${escrow.seller.slice(0, 6)}...${escrow.seller.slice(-4)}`}
              </span>
              <span>Token {escrow.tokenKey}</span>
              <span>Amount {escrow.amount}</span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              {isConnected ? (
                <Link
                  to={`/app/escrows/${escrow.escrowId}`}
                  className="btn btn-outline text-xs uppercase tracking-[0.3em]"
                >
                  View escrow
                </Link>
              ) : (
                <span className="text-xs text-[color:var(--muted)]">
                  Connect wallet to view details
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
