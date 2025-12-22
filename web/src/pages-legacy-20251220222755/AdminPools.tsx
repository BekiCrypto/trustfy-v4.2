import { useMemo, useState } from "react"
import { useAdminPools, useWithdrawPlatform as useAdminWithdraw } from "../hooks/admin"
import { useWithdrawPlatform as useWithdrawTx } from "../hooks/contract"
import { TxFlowModal } from "../components/TxFlowModal"
import { BLOCK_EXPLORER_BASE } from "../lib/config"

const AdminPoolsPage = () => {
  const [filterToken, setFilterToken] = useState("")
  const [form, setForm] = useState({ tokenKey: "", feeAmount: "0", bondAmount: "0" })
  const { data: pools, isLoading } = useAdminPools(filterToken || undefined)
  const withdraw = useAdminWithdraw()
  const [modalOpen, setModalOpen] = useState(false)

  const parsed = useMemo(() => {
    try {
      return {
        tokenKey: form.tokenKey,
        feeAmount: BigInt(form.feeAmount || "0"),
        bondAmount: BigInt(form.bondAmount || "0"),
      }
    } catch {
      return {
        tokenKey: form.tokenKey,
        feeAmount: 0n,
        bondAmount: 0n,
      }
    }
  }, [form.bondAmount, form.feeAmount, form.tokenKey])

  const withdrawTx = useWithdrawTx(
    parsed.tokenKey,
    parsed.feeAmount,
    parsed.bondAmount
  )

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">Pools</p>
        <h1 className="section-title text-[color:var(--ink)]">Platform revenue</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Fees and bond revenue remain on-chain until admin withdraws.
        </p>
      </header>

      <div className="card p-6">
        <p className="eyebrow">Filter pools</p>
        <input
          value={filterToken}
          onChange={(event) => setFilterToken(event.target.value)}
          className="input mt-2"
          placeholder="TokenKey"
        />
      </div>

      <TxFlowModal
        open={modalOpen}
        status={withdrawTx.status ?? "idle"}
        txHash={withdrawTx.txHash}
        error={withdrawTx.error}
        explorerUrl={
          withdrawTx.txHash ? `${BLOCK_EXPLORER_BASE}/tx/${withdrawTx.txHash}` : undefined
        }
        onClose={() => setModalOpen(false)}
      />

      <form className="card grid gap-4 p-6">
        <p className="eyebrow">Withdraw</p>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm text-[color:var(--muted)]">
            TokenKey
            <input
              value={form.tokenKey}
              onChange={(event) => setForm({ ...form, tokenKey: event.target.value })}
              className="input mt-1"
              placeholder="0x..."
            />
          </label>
          <label className="text-sm text-[color:var(--muted)]">
            Fee amount
            <input
              value={form.feeAmount}
              onChange={(event) => setForm({ ...form, feeAmount: event.target.value })}
              className="input mt-1"
              type="number"
              min="0"
            />
          </label>
          <label className="text-sm text-[color:var(--muted)]">
            Bond amount
            <input
              value={form.bondAmount}
              onChange={(event) => setForm({ ...form, bondAmount: event.target.value })}
              className="input mt-1"
              type="number"
              min="0"
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <button
            className="btn btn-primary w-full text-xs uppercase tracking-[0.3em] disabled:opacity-50"
            type="button"
            onClick={() => {
              setModalOpen(true)
              withdrawTx.execute?.()
            }}
            disabled={withdrawTx.status !== "idle" || !form.tokenKey}
          >
            Withdraw on-chain
          </button>
          <button
            className="btn btn-outline w-full text-xs uppercase tracking-[0.3em] disabled:opacity-50"
            type="button"
            onClick={() =>
              withdraw.mutate({
                tokenKey: form.tokenKey,
                feeAmount: form.feeAmount,
                bondAmount: form.bondAmount,
              })
            }
            disabled={withdraw.isPending || !form.tokenKey}
          >
            Record withdrawal intent
          </button>
        </div>
        <p className="text-xs text-[color:var(--muted)]">
          Use the on-chain action to execute withdrawals. Recording intent stores the audit trail in the backend.
        </p>
        {withdraw.isPending && (
          <p className="text-xs text-[color:var(--muted)]">Saving withdrawal intent…</p>
        )}
        {withdraw.isSuccess && (
          <p className="text-xs text-[color:var(--accent)]">Intent recorded.</p>
        )}
      </form>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-[color:var(--muted)]">Loading pools…</p>}
        {!isLoading && (!pools || pools.length === 0) && (
          <p className="text-sm text-[color:var(--muted)]">No pool data available.</p>
        )}
        {pools?.map((pool) => (
          <article
            key={pool.tokenKey}
            className="card-soft p-4 text-xs text-[color:var(--muted)]"
          >
            <p className="eyebrow">{pool.tokenKey}</p>
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              <span>Fees {pool.feeAmount}</span>
              <span>Seller {pool.sellerBond}</span>
              <span>Buyer {pool.buyerBond}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default AdminPoolsPage
