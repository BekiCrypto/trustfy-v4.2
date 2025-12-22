import { Link } from "react-router-dom"
import { useMemo, useState } from "react"
import type { DisputeSummary } from "@trustfy/shared"
import { useDisputes } from "../hooks/dispute"

const isOpenStatus = (status?: string) =>
  status === "OPEN" || status === "RECOMMENDED" || status === "UNDER_REVIEW"

const ArbitratorDisputesPage = () => {
  const [activeTab, setActiveTab] = useState<"open" | "resolved">("open")
  const { data, isLoading } = useDisputes()

  const openDisputes = useMemo(
    () => (data ?? []).filter((dispute) => isOpenStatus(dispute.status)),
    [data]
  )
  const resolvedDisputes = useMemo(
    () => (data ?? []).filter((dispute) => dispute.status === "RESOLVED"),
    [data]
  )

  const activeList = activeTab === "open" ? openDisputes : resolvedDisputes

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">Disputes</p>
        <h1 className="section-title text-[color:var(--ink)]">Arbitrator queue</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Review opened cases, evidence, and recommendations.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="stat-card hover-lift">
          <p className="eyebrow">Total</p>
          <p className="text-3xl font-semibold text-[color:var(--ink)]">{data?.length ?? 0}</p>
        </article>
        <article className="stat-card hover-lift">
          <p className="eyebrow">Open</p>
          <p className="text-3xl font-semibold text-[color:var(--ink)]">{openDisputes.length}</p>
        </article>
        <article className="stat-card hover-lift">
          <p className="eyebrow">Resolved</p>
          <p className="text-3xl font-semibold text-[color:var(--ink)]">{resolvedDisputes.length}</p>
        </article>
      </div>

      <div className="tabs-list grid-cols-2">
        <button
          type="button"
          className={`tab ${activeTab === "open" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("open")}
        >
          Open Disputes ({openDisputes.length})
        </button>
        <button
          type="button"
          className={`tab ${activeTab === "resolved" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("resolved")}
        >
          Resolved ({resolvedDisputes.length})
        </button>
      </div>

      {isLoading && (
        <p className="text-sm text-[color:var(--muted)]">Loading disputes…</p>
      )}

      <div className="space-y-3">
        {activeList?.map((dispute: DisputeSummary) => (
          <article
            key={dispute.escrowId}
            className="card-soft p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[color:var(--muted)]">
              <span>Escrow {dispute.escrowId}</span>
              <span className="pill">{dispute.status}</span>
            </div>
            <p className="mt-2 text-[color:var(--muted)]">
              {dispute.summary ?? "No summary"}
            </p>
            <Link
              to={`/arbitrator/disputes/${dispute.escrowId}`}
              className="btn btn-outline mt-4 text-xs uppercase tracking-[0.3em]"
            >
              View dispute
            </Link>
          </article>
        ))}
        {!isLoading && activeList?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-6 text-center text-sm text-[color:var(--muted)]">
            No disputes in this view.
          </div>
        )}
      </div>
    </section>
  )
}

export default ArbitratorDisputesPage
