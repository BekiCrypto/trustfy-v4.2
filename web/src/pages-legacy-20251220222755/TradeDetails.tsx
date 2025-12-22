import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ethers } from "ethers"
import { useQueryClient } from "@tanstack/react-query"
import { useAccount, useChainId } from "wagmi"
import { useAuthContext } from "../context/AuthContext"
import { EvidenceUploader } from "../components/EvidenceUploader"
import { NextActionPanel } from "../components/NextActionPanel"
import { TxFlowModal } from "../components/TxFlowModal"
import { StateBadge } from "../components/StateBadge"
import {
  useEscrow,
  useEscrowTimeline,
  useMessages,
  useSendMessage,
} from "../hooks/escrow"
import { computeNextActions, type WalletRole } from "../hooks/nextAction"
import {
  useConfirmPayment,
  useFundEscrow,
  useOpenDispute,
  useReleaseEscrow,
  useTakeEscrow,
} from "../hooks/contract"
import { BLOCK_EXPLORER_BASE, TARGET_CHAIN_ID } from "../lib/config"
import {
  usePaymentInstructions,
  useSavePaymentInstructions,
} from "../hooks/paymentInstructions"
import { useDisputeDetail, useOpenDisputeCase } from "../hooks/dispute"
import { usePostFiatStatus } from "../hooks/coordination"

const buildRef = (escrowId: string | undefined, action: string) => {
  if (!escrowId) return "0x0"
  return ethers.id(`${escrowId}:${action}:${Date.now()}:${Math.random()}`)
}

const formatAddress = (value?: string | null) => {
  if (!value) return "Not set"
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

const EscrowDetailPage = () => {
  const { escrowId } = useParams<{ escrowId: string }>()

  const { data: escrow, isLoading: loadingEscrow } = useEscrow(escrowId)
  const { data: timeline, isLoading: loadingTimeline } = useEscrowTimeline(escrowId)
  const { data: messages, isLoading: loadingMessages } = useMessages(escrowId)
  const messageMutation = useSendMessage(escrowId)

  const [draft, setDraft] = useState("")
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"chat" | "payment" | "evidence" | "dispute" | "fiat">("chat")

  const { session } = useAuthContext()
  const queryClient = useQueryClient()

  const { isConnected } = useAccount()
  const chainId = useChainId()
  const networkMismatch = Boolean(isConnected && chainId !== TARGET_CHAIN_ID)

  const { data: paymentInstructions, isLoading: loadingInstructions } =
    usePaymentInstructions(escrowId)
  const saveInstructions = useSavePaymentInstructions(escrowId)
  const { data: disputeDetail, error: disputeError } = useDisputeDetail(escrowId)
  const openDisputeCase = useOpenDisputeCase(escrowId)
  const postFiatStatus = usePostFiatStatus(escrowId)

  const [instructionFields, setInstructionFields] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    additionalInfo: "",
  })
  const [disputeReason, setDisputeReason] = useState("PAYMENT_NOT_RECEIVED")
  const [disputeSummary, setDisputeSummary] = useState("")
  const [fiatStatus, setFiatStatus] = useState("SENT")
  const [fiatNote, setFiatNote] = useState("")
  const [fiatHistory, setFiatHistory] = useState<
    { id: string; status: string; note?: string; actor: string; createdAt: string }[]
  >([])

  // Wallet flows
  const take = useTakeEscrow(escrowId)
  const fund = useFundEscrow(escrowId)
  const confirm = useConfirmPayment(escrowId)
  const release = useReleaseEscrow(escrowId)
  const dispute = useOpenDispute(escrowId)

  const activeFlow =
    activeAction === "take"
      ? take
      : activeAction === "fund"
      ? fund
      : activeAction === "confirm"
      ? confirm
      : activeAction === "release"
      ? release
      : activeAction === "dispute"
      ? dispute
      : undefined

  useEffect(() => {
    if (paymentInstructions?.contentJson) {
      const payload = paymentInstructions.contentJson as Record<string, string>
      setInstructionFields({
        bankName: payload.bankName ?? "",
        accountNumber: payload.accountNumber ?? "",
        accountName: payload.accountName ?? "",
        additionalInfo: payload.additionalInfo ?? "",
      })
    }
  }, [paymentInstructions])

  useEffect(() => {
    if (activeFlow?.status === "confirmed" && escrowId) {
      queryClient.invalidateQueries({ queryKey: ["escrow", escrowId] })
      queryClient.invalidateQueries({ queryKey: ["timeline", escrowId] })
      queryClient.invalidateQueries({ queryKey: ["messages", escrowId] })
    }
  }, [activeFlow?.status, escrowId, queryClient])

  const walletRoles: WalletRole[] = (session?.roles ?? []).filter(
    (role) => role === "USER" || role === "ARBITRATOR" || role === "ADMIN"
  )

  const walletAddress = session?.address ?? null
  const walletAddressLower = walletAddress ? walletAddress.toLowerCase() : null
  const isSeller =
    Boolean(walletAddressLower) &&
    Boolean(escrow?.seller) &&
    walletAddressLower === escrow?.seller.toLowerCase()
  const buyerLower = escrow?.buyer?.toLowerCase()
  const isBuyer =
    Boolean(walletAddressLower) &&
    Boolean(buyerLower) &&
    walletAddressLower === buyerLower

  const actions = computeNextActions({
    escrow,
    state: escrow?.state,
    walletAddress,
    roles: walletRoles,
  })

  const handlers = useMemo(
    () => ({
      take: {
        onClick: () => {
          setActiveAction("take")
          take.execute?.()
        },
        disabled: take.status !== "idle" || networkMismatch,
      },
      fund: {
        onClick: () => {
          setActiveAction("fund")
          fund.execute?.({
            args: [escrowId, buildRef(escrowId, "fund")],
          })
        },
        disabled: fund.status !== "idle" || networkMismatch,
      },
      confirm: {
        onClick: () => {
          setActiveAction("confirm")
          confirm.execute?.({
            args: [escrowId, buildRef(escrowId, "confirm")],
          })
        },
        disabled: confirm.status !== "idle" || networkMismatch,
      },
      release: {
        onClick: () => {
          setActiveAction("release")
          release.execute?.({
            args: [escrowId, buildRef(escrowId, "release")],
          })
        },
        disabled: release.status !== "idle" || networkMismatch,
      },
      dispute: {
        onClick: () => {
          setActiveAction("dispute")
          dispute.execute?.()
        },
        disabled: dispute.status !== "idle" || networkMismatch,
      },
    }),
    [confirm, dispute, escrowId, fund, networkMismatch, release, take]
  )

  const handleSend = () => {
    if (!draft.trim()) return
    messageMutation.mutate({ text: draft })
    setDraft("")
  }

  const handleSaveInstructions = () => {
    saveInstructions.mutate({
      contentJson: {
        bankName: instructionFields.bankName,
        accountNumber: instructionFields.accountNumber,
        accountName: instructionFields.accountName,
        additionalInfo: instructionFields.additionalInfo,
      },
    })
  }

  const handleOpenDisputeCase = () => {
    if (!disputeReason.trim()) return
    openDisputeCase.mutate({ reasonCode: disputeReason, summary: disputeSummary || undefined })
  }

  const handleFiatStatus = async () => {
    if (!fiatStatus.trim()) return
    const entry = await postFiatStatus.mutateAsync({
      status: fiatStatus,
      note: fiatNote || undefined,
    })
    setFiatHistory((prev) => [entry, ...prev])
    setFiatNote("")
  }

  return (
    <section className="space-y-6">
      <TxFlowModal
        open={Boolean(activeAction)}
        status={activeFlow?.status ?? "idle"}
        txHash={activeFlow?.txHash}
        error={activeFlow?.error}
        explorerUrl={
          activeFlow?.txHash
            ? `${BLOCK_EXPLORER_BASE}/tx/${activeFlow.txHash}`
            : undefined
        }
        onClose={() => setActiveAction(null)}
      />

      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Escrow detail</p>
            <h1 className="section-title text-[color:var(--ink)]">
              Escrow {escrowId?.slice(0, 8)}
            </h1>
            <p className="text-sm text-[color:var(--muted)]">
              Live snapshot of on-chain state plus coordination tools.
            </p>
          </div>
          <Link to="/trades" className="btn btn-outline text-xs uppercase tracking-[0.3em]">
            Back to escrows
          </Link>
        </div>
      </header>

      {networkMismatch && (
        <div className="alert">
          Switch wallet to chain {TARGET_CHAIN_ID} before interacting.
        </div>
      )}

      {loadingEscrow ? (
        <p className="text-sm text-[color:var(--muted)]">Loading escrow…</p>
      ) : !escrow ? (
        <div className="alert">Escrow not found.</div>
      ) : (
        <>
          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Overview</p>
                <h2 className="text-2xl font-semibold text-[color:var(--ink)]">
                  {escrow.amount} {escrow.tokenKey}
                </h2>
                <p className="text-sm text-[color:var(--muted)]">
                  Escrow ID {escrow.escrowId}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StateBadge state={escrow.state} />
                {isSeller && <span className="badge-soft">Seller</span>}
                {isBuyer && <span className="badge-soft">Buyer</span>}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[color:var(--line)] bg-slate-900/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
                  Participants
                </p>
                <div className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
                  <p>Seller {formatAddress(escrow.seller)}</p>
                  <p>Buyer {formatAddress(escrow.buyer)}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-[color:var(--line)] bg-slate-900/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
                  Terms
                </p>
                <div className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
                  <p>TokenKey {escrow.tokenKey}</p>
                  <p>Fee {escrow.feeAmount ?? "0"}</p>
                  <p>Seller Bond {escrow.sellerBond ?? "0"}</p>
                  <p>Buyer Bond {escrow.buyerBond ?? "0"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="card p-5 lg:col-span-2">
              <p className="eyebrow">Next action</p>
              <div className="mt-4">
                <NextActionPanel actions={actions} handlers={handlers} />
              </div>
            </div>

            <div className="card p-5">
              <p className="eyebrow">Timeline</p>
              <div className="mt-4 space-y-3">
                {loadingTimeline && (
                  <p className="text-xs text-[color:var(--muted)]">Loading timeline…</p>
                )}
                {!loadingTimeline && !timeline?.length && (
                  <p className="text-xs text-[color:var(--muted)]">No timeline events yet.</p>
                )}
                {timeline?.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-2xl border border-[color:var(--line)] bg-slate-900/60 p-3"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
                      {event.eventName}
                    </p>
                    <p className="text-sm font-semibold text-[color:var(--ink)]">
                      {event.stateAfter}
                    </p>
                    <p className="text-xs text-[color:var(--muted)]">
                      Block {event.blockNumber} · Tx {event.txHash}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="tabs-list grid-cols-5">
              {[
                { id: "chat", label: "Chat" },
                { id: "payment", label: "Payment" },
                { id: "evidence", label: "Evidence" },
                { id: "dispute", label: "Dispute" },
                { id: "fiat", label: "Fiat Status" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`tab ${activeTab === tab.id ? "tab-active" : ""}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "chat" && (
              <div className="mt-5 space-y-4">
                {loadingMessages && (
                  <p className="text-xs text-[color:var(--muted)]">Loading chat…</p>
                )}
                {!loadingMessages && !messages?.length && (
                  <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-4 text-center text-xs text-[color:var(--muted)]">
                    No messages yet.
                  </div>
                )}
                <div className="space-y-3">
                  {messages?.map((message) => {
                    const sender = message.sender ?? ""
                    const isMe =
                      Boolean(walletAddressLower) &&
                      walletAddressLower === sender.toLowerCase()
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                            isMe
                              ? "bg-[color:var(--accent)] text-white"
                              : "bg-slate-800/70 text-[color:var(--ink)]"
                          }`}
                        >
                          <div className="mb-1 text-[0.65rem] uppercase tracking-[0.25em] opacity-70">
                            {isMe ? "You" : formatAddress(sender)}
                          </div>
                          <p>{message.text}</p>
                          <div className="mt-1 text-[0.65rem] opacity-70">
                            {new Date(message.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="space-y-2">
                  <textarea
                    className="input"
                    rows={3}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Update buyer/seller or arbitrator"
                  />
                  <button
                    className="btn btn-primary w-full text-xs uppercase tracking-[0.3em]"
                    onClick={handleSend}
                    disabled={messageMutation.isPending}
                  >
                    Send message
                  </button>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[color:var(--line)] bg-slate-900/60 p-4">
                  <p className="eyebrow">Instructions</p>
                  {isSeller ? (
                    <div className="mt-4 space-y-3">
                      <label className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
                        Bank name
                        <input
                          className="input mt-1"
                          value={instructionFields.bankName}
                          onChange={(event) =>
                            setInstructionFields({
                              ...instructionFields,
                              bankName: event.target.value,
                            })
                          }
                          placeholder="Bank name"
                        />
                      </label>
                      <label className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
                        Account number
                        <input
                          className="input mt-1"
                          value={instructionFields.accountNumber}
                          onChange={(event) =>
                            setInstructionFields({
                              ...instructionFields,
                              accountNumber: event.target.value,
                            })
                          }
                          placeholder="Account number"
                        />
                      </label>
                      <label className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
                        Account name
                        <input
                          className="input mt-1"
                          value={instructionFields.accountName}
                          onChange={(event) =>
                            setInstructionFields({
                              ...instructionFields,
                              accountName: event.target.value,
                            })
                          }
                          placeholder="Account holder name"
                        />
                      </label>
                      <label className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
                        Additional info
                        <textarea
                          rows={3}
                          className="input mt-1"
                          value={instructionFields.additionalInfo}
                          onChange={(event) =>
                            setInstructionFields({
                              ...instructionFields,
                              additionalInfo: event.target.value,
                            })
                          }
                          placeholder="Reference number, notes"
                        />
                      </label>
                      <button
                        type="button"
                        className="btn btn-primary w-full text-xs uppercase tracking-[0.3em] disabled:opacity-50"
                        onClick={handleSaveInstructions}
                        disabled={saveInstructions.isPending}
                      >
                        {saveInstructions.isPending ? "Saving…" : "Save instructions"}
                      </button>
                      {saveInstructions.isSuccess && (
                        <p className="text-xs text-[color:var(--accent)]">
                          Instructions updated.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
                      {loadingInstructions ? (
                        <p>Loading instructions…</p>
                      ) : !paymentInstructions?.contentJson ? (
                        <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-4 text-center text-xs">
                          Waiting for seller to provide instructions.
                        </div>
                      ) : (
                        <>
                          <p>Bank {instructionFields.bankName || "-"}</p>
                          <p>Account {instructionFields.accountNumber || "-"}</p>
                          <p>Name {instructionFields.accountName || "-"}</p>
                          <p>Notes {instructionFields.additionalInfo || "-"}</p>
                          {paymentInstructions?.updatedAt && (
                            <p className="text-xs text-[color:var(--muted)]">
                              Updated {new Date(paymentInstructions.updatedAt).toLocaleString()}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-[color:var(--line)] bg-slate-900/60 p-4">
                  <p className="eyebrow">Status</p>
                  <p className="mt-3 text-sm text-[color:var(--muted)]">
                    Buyer should confirm payment once fiat is sent.
                  </p>
                  {isBuyer && (
                    <div className="mt-4 rounded-2xl border border-[color:var(--line)] bg-slate-900/70 px-3 py-2 text-xs text-[color:var(--muted)]">
                      Payment confirmation locks buyer bond on-chain.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "evidence" && (
              <div className="mt-5">
                <EvidenceUploader escrowId={escrowId ?? ""} />
              </div>
            )}

            {activeTab === "dispute" && (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[color:var(--line)] bg-slate-900/60 p-4">
                  <p className="eyebrow">Open dispute case</p>
                  {disputeDetail ? (
                    <div className="mt-4 space-y-2 text-sm text-[color:var(--muted)]">
                      <p>Status {disputeDetail.status}</p>
                      <p>Opened by {disputeDetail.openedBy}</p>
                      <p>Summary {disputeDetail.summary ?? "-"}</p>
                      {disputeDetail.outcome && (
                        <p>Outcome {disputeDetail.outcome}</p>
                      )}
                      <p className="text-xs text-[color:var(--muted)]">
                        Case recorded. Use the Next Action panel to open or resolve on-chain.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <label className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
                        Reason code
                        <select
                          className="input mt-1"
                          value={disputeReason}
                          onChange={(event) => setDisputeReason(event.target.value)}
                        >
                          <option value="PAYMENT_NOT_RECEIVED">Payment not received</option>
                          <option value="PAYMENT_NOT_SENT">Payment not sent</option>
                          <option value="FRAUD_SUSPECTED">Fraud suspected</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </label>
                      <label className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
                        Summary
                        <textarea
                          rows={4}
                          className="input mt-1"
                          value={disputeSummary}
                          onChange={(event) => setDisputeSummary(event.target.value)}
                          placeholder="Describe the issue and evidence"
                        />
                      </label>
                      <button
                        type="button"
                        className="btn btn-danger w-full text-xs uppercase tracking-[0.3em] disabled:opacity-50"
                        onClick={handleOpenDisputeCase}
                        disabled={openDisputeCase.isPending || (!isSeller && !isBuyer)}
                      >
                        {openDisputeCase.isPending ? "Submitting…" : "Record dispute case"}
                      </button>
                      {openDisputeCase.isSuccess && (
                        <p className="text-xs text-[color:var(--accent)]">
                          Case recorded. Open the dispute on-chain to continue.
                        </p>
                      )}
                      {openDisputeCase.isError && (
                        <p className="text-xs text-[#b13636]">
                          {openDisputeCase.error?.message ?? "Unable to open case."}
                        </p>
                      )}
                      {disputeError && (
                        <p className="text-xs text-[color:var(--muted)]">
                          No dispute case found yet.
                        </p>
                      )}
                      {!isSeller && !isBuyer && (
                        <p className="text-xs text-[color:var(--muted)]">
                          Only escrow participants can open a dispute case.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-[color:var(--line)] bg-slate-900/60 p-4">
                  <p className="eyebrow">On-chain dispute</p>
                  <p className="mt-3 text-sm text-[color:var(--muted)]">
                    Use the Next Action panel to open or resolve disputes on-chain. The backend does not sign transactions.
                  </p>
                  <div className="mt-4 rounded-2xl border border-dashed border-[color:var(--line)] p-4 text-xs text-[color:var(--muted)]">
                    Dispute outcome is finalized on-chain by an arbitrator wallet.
                  </div>
                </div>
              </div>
            )}

            {activeTab === "fiat" && (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[color:var(--line)] bg-slate-900/60 p-4">
                  <p className="eyebrow">Update fiat status</p>
                  <div className="mt-4 space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
                      Status
                      <select
                        className="input mt-1"
                        value={fiatStatus}
                        onChange={(event) => setFiatStatus(event.target.value)}
                      >
                        <option value="SENT">Sent</option>
                        <option value="RECEIVED">Received</option>
                        <option value="PENDING">Pending</option>
                        <option value="ISSUE">Issue</option>
                      </select>
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
                      Note
                      <textarea
                        rows={3}
                        className="input mt-1"
                        value={fiatNote}
                        onChange={(event) => setFiatNote(event.target.value)}
                        placeholder="Optional note for the counterparty"
                      />
                    </label>
                    <button
                      type="button"
                      className="btn btn-primary w-full text-xs uppercase tracking-[0.3em] disabled:opacity-50"
                      onClick={handleFiatStatus}
                      disabled={postFiatStatus.isPending || (!isSeller && !isBuyer)}
                    >
                      {postFiatStatus.isPending ? "Posting…" : "Post status update"}
                    </button>
                    {postFiatStatus.isError && (
                      <p className="text-xs text-[#b13636]">
                        {postFiatStatus.error?.message ?? "Unable to post status."}
                      </p>
                    )}
                    {!isSeller && !isBuyer && (
                      <p className="text-xs text-[color:var(--muted)]">
                        Only escrow participants can post fiat status updates.
                      </p>
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-[color:var(--line)] bg-slate-900/60 p-4">
                  <p className="eyebrow">Recent updates</p>
                  <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
                    {fiatHistory.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-4 text-center text-xs text-[color:var(--muted)]">
                        Status updates will appear here after submission.
                      </div>
                    ) : (
                      fiatHistory.map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-2xl border border-[color:var(--line)] bg-slate-900/70 px-3 py-2"
                        >
                          <p className="text-xs font-semibold text-[color:var(--ink)]">{entry.status}</p>
                          <p className="text-xs text-[color:var(--muted)]">{entry.note || "No note"}</p>
                          <p className="text-[0.7rem] text-[color:var(--muted)]">
                            {entry.actor} · {new Date(entry.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default EscrowDetailPage
