import { useState } from "react"
import { Link } from "react-router-dom"
import type { EscrowSummary } from "@trustfy/shared"
import { useEscrows } from "../hooks/escrow"
import { StateBadge } from "../components/StateBadge"

const roles = ["seller", "buyer"] as const

const formatAddress = (value?: string | null) => {
  if (!value) return "Not set"
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

const MyEscrowsPage = () => {
  const [role, setRole] = useState<typeof roles[number]>("seller")
  const [statusFilter, setStatusFilter] = useState("")
  const { data, isLoading } = useEscrows({
    role,
    status: statusFilter || undefined,
    page: 1,
    pageSize: 20,
  })

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">My Escrows</p>
        <h1 className="section-title text-[color:var(--ink)]">Role-aware list</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Track escrows where you are the seller or buyer.
        </p>
      </header>

      <div className="tabs-list grid-cols-2">
        {roles.map((option) => (
          <button
            key={option}
            onClick={() => setRole(option)}
            className={`tab ${role === option ? "tab-active" : ""}`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs uppercase tracking-[0.25em] text-[color:var(--muted)]">
          Status
        </label>
        <input
          className="input w-full md:w-[240px]"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          placeholder="CREATED, FUNDED, DISPUTED..."
        />
      </div>

      <div className="space-y-4">
        {isLoading && (
          <p className="text-sm text-[color:var(--muted)]">Loading your escrows…</p>
        )}
        {data?.items?.map((escrow: EscrowSummary) => (
          <article
            key={escrow.escrowId}
            className="card-soft hover-lift p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">{role} Escrow</p>
                <h2 className="text-lg font-semibold text-[color:var(--ink)]">
                  {escrow.escrowId}
                </h2>
              </div>
              <StateBadge state={escrow.state} />
            </div>
            <div className="mt-3 grid gap-2 text-sm text-[color:var(--muted)] md:grid-cols-2">
              <p>Seller {formatAddress(escrow.seller)}</p>
              <p>Buyer {formatAddress(escrow.buyer)}</p>
              <p>Token {escrow.tokenKey}</p>
              <p>Amount {escrow.amount}</p>
              <p>Fee {escrow.feeAmount} / SellerBond {escrow.sellerBond}</p>
              <p>BuyerBond {escrow.buyerBond}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Link
                to={`/trade-details/${escrow.escrowId}`}
                className="btn btn-outline text-xs uppercase tracking-[0.3em]"
              >
                Track timeline
              </Link>
              <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Updated block {escrow.updatedAtBlock}
              </span>
            </div>
          </article>
        ))}
        {!isLoading && data?.items?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-6 text-center text-sm text-[color:var(--muted)]">
            No escrows found for your {role} role.
          </div>
        )}
      </div>
    </section>
  )
}

export default MyEscrowsPage
