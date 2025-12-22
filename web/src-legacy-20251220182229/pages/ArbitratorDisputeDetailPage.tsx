import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { DISPUTE_OUTCOMES, type DisputeOutcome } from "@trustfy/shared"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useChainId, useChains } from "wagmi"
import { ethers } from "ethers"
import { submitDisputeRecommendation } from "../lib/api"
import { useDisputeDetail } from "../hooks/dispute"
import { useResolveDispute } from "../hooks/contract"
import { TxFlowModal } from "../components/TxFlowModal"
import { useEscrowTimeline } from "../hooks/escrow"
import { useEvidenceList } from "../hooks/evidence"
import { BLOCK_EXPLORER_BASE, TARGET_CHAIN_ID } from "../lib/config"

const buildRef = (escrowId: string | undefined) => {
  if (!escrowId) return "0x0"
  return ethers.id(`${escrowId}:${Date.now()}:${Math.random()}`)
}

export const ArbitratorDisputeDetailPage = () => {
  const { escrowId } = useParams<{ escrowId: string }>()
  const { data: dispute, isLoading } = useDisputeDetail(escrowId)
  const chainId = useChainId()
  const chains = useChains()
  const activeChain = chains.find((chain) => chain.id === chainId)
  const networkMismatch = Boolean(chainId && chainId !== TARGET_CHAIN_ID)
  const resolveFlow = useResolveDispute(escrowId)
  const queryClient = useQueryClient()
  const { data: timeline, isLoading: loadingTimeline } = useEscrowTimeline(escrowId)
  const { data: evidence, isLoading: loadingEvidence } = useEvidenceList(escrowId)
  const recommendation = useMutation({
    mutationFn: (payload: Parameters<typeof submitDisputeRecommendation>[1]) => {
      if (!escrowId) {
        return Promise.reject(new Error("missing escrow"))
      }
      return submitDisputeRecommendation(escrowId, payload)
    },
  })
  const [note, setNote] = useState("")
  const [selectedOutcome, setSelectedOutcome] = useState<DisputeOutcome>("NONE")
  const [modalOpen, setModalOpen] = useState(false)

  const numericOutcome =
    selectedOutcome === "BUYER_WINS"
      ? 1
      : selectedOutcome === "SELLER_WINS"
      ? 2
      : undefined

  useEffect(() => {
    if (resolveFlow.status === "confirmed") {
      if (escrowId) {
        queryClient.invalidateQueries({ queryKey: ["dispute", escrowId] })
      }
    }
  }, [resolveFlow.status, escrowId, queryClient])

  const handleResolve = async () => {
    if (!numericOutcome) return
    if (note.trim()) {
      await recommendation.mutateAsync({ note })
    }
    setModalOpen(true)
    resolveFlow.execute?.({
      args: [escrowId, numericOutcome, buildRef(escrowId)],
    })
  }

  return (
    <section className="space-y-6">
      <TxFlowModal
        open={modalOpen}
        status={resolveFlow.status ?? "idle"}
        txHash={resolveFlow.txHash}
        error={resolveFlow.error}
        explorerUrl={
          resolveFlow.txHash ? `${BLOCK_EXPLORER_BASE}/tx/${resolveFlow.txHash}` : undefined
        }
        onClose={() => setModalOpen(false)}
      />

      <header className="space-y-3">
        <p className="eyebrow">Dispute</p>
        <h1 className="section-title text-slate-950">
          Escrow {dispute?.escrow?.escrowId ?? escrowId}
        </h1>
      </header>

      {networkMismatch && (
        <div className="alert">
          Switch wallet to chain {TARGET_CHAIN_ID} before resolving disputes.
          {activeChain ? ` Current ${activeChain.name}.` : ""}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-[color:var(--muted)]">Loading dispute…</p>
      ) : (
        dispute && (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <article className="card p-5">
                <p className="eyebrow">Status</p>
                <p className="text-lg font-semibold text-slate-950">{dispute.status}</p>
                <p className="text-xs text-[color:var(--muted)]">
                  Opened by {dispute.openedBy}
                </p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  {dispute.summary ?? "No summary provided"}
                </p>
              </article>

              <article className="card p-5">
                <p className="eyebrow">Recommendation</p>
                <textarea
                  rows={4}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="input mt-3"
                  placeholder="Summarize facts to share with the backend"
                />
                <div className="mt-3 flex flex-wrap gap-3">
                  {DISPUTE_OUTCOMES.filter((outcome) => outcome !== "NONE").map(
                    (outcome) => (
                      <button
                        key={outcome}
                        type="button"
                        onClick={() => setSelectedOutcome(outcome)}
                        className={`btn text-xs uppercase tracking-[0.3em] ${
                          selectedOutcome === outcome ? "btn-primary" : "btn-outline"
                        }`}
                      >
                        {outcome.replace("_", " ")}
                      </button>
                    )
                  )}
                </div>
                <button
                  className="btn btn-primary mt-4 w-full text-xs uppercase tracking-[0.3em] disabled:opacity-40"
                  onClick={handleResolve}
                  disabled={!numericOutcome || resolveFlow.status !== "idle" || networkMismatch}
                >
                  Resolve dispute on-chain
                </button>
                {recommendation.isError && (
                  <p className="mt-2 text-xs text-[#b13636]">
                    Unable to record recommendation.
                  </p>
                )}
              </article>
            </div>

            <div className="space-y-4">
              <section className="card p-5">
                <p className="eyebrow">Timeline</p>
                <div className="mt-3 space-y-3">
                  {loadingTimeline && (
                    <p className="text-xs text-[color:var(--muted)]">Loading history…</p>
                  )}
                  {!loadingTimeline &&
                    (timeline?.length ? (
                      timeline.map((event) => (
                        <article
                          key={event.id}
                          className="rounded-2xl border border-[color:var(--line)] bg-white/70 p-3"
                        >
                          <p className="eyebrow">{event.eventName}</p>
                          <p className="text-sm font-semibold text-slate-950">
                            {event.stateAfter}
                          </p>
                          <p className="text-xs text-[color:var(--muted)]">
                            Block {event.blockNumber} · Tx {event.txHash}
                          </p>
                        </article>
                      ))
                    ) : (
                      <p className="text-xs text-[color:var(--muted)]">No timeline yet.</p>
                    ))}
                </div>
              </section>

              <section className="card p-5">
                <p className="eyebrow">Evidence</p>
                <div className="mt-3 space-y-2">
                  {loadingEvidence && (
                    <p className="text-xs text-[color:var(--muted)]">Loading evidence…</p>
                  )}
                  {!loadingEvidence &&
                    (evidence?.length ? (
                      evidence.map((item) => (
                        <article
                          key={item.id}
                          className="flex items-center justify-between rounded-2xl border border-[color:var(--line)] bg-white/70 px-3 py-2 text-xs text-[color:var(--muted)]"
                        >
                          <span>{item.uploader}</span>
                          <a
                            href={item.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[color:var(--accent-3)] underline"
                          >
                            View
                          </a>
                        </article>
                      ))
                    ) : (
                      <p className="text-xs text-[color:var(--muted)]">No evidence uploaded yet.</p>
                    ))}
                </div>
              </section>
            </div>
          </div>
        )
      )}
    </section>
  )
}
