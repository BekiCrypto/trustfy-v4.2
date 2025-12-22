interface TxFlowModalProps {
  open: boolean
  status: "idle" | "preparing" | "wallet" | "pending" | "confirmed" | "error"
  txHash?: string | null
  explorerUrl?: string
  error?: unknown
  onClose?: () => void
}

const STEP_LABELS: Record<TxFlowModalProps["status"], string> = {
  idle: "Waiting for your action",
  preparing: "Preparing transaction",
  wallet: "Confirm wallet prompt",
  pending: "Transaction on-chain",
  confirmed: "Transaction confirmed",
  error: "Action failed",
}

export const TxFlowModal = ({ open, status, txHash, explorerUrl, error, onClose }: TxFlowModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-6 text-sm text-[color:var(--ink)] shadow-[var(--shadow-card)]">
        <p className="eyebrow">Transaction status</p>
        <h2 className="mt-2 text-lg font-semibold">{STEP_LABELS[status]}</h2>
        <p className="mt-2 text-xs text-[color:var(--muted)]">
          Monitor the wallet prompt and wait for confirmations before leaving this page.
        </p>
        {status === "pending" && txHash && (
          <p className="text-xs text-[color:var(--muted)]">
            Tx{" "}
            <a href={explorerUrl} className="text-[color:var(--accent-3)] underline" target="_blank" rel="noreferrer">
              {txHash}
            </a>
          </p>
        )}
        {status === "confirmed" && txHash && (
          <p className="text-xs text-[color:var(--muted)]">
            Confirmed –{" "}
            {explorerUrl ? (
              <a href={explorerUrl} className="text-[color:var(--accent-3)] underline" target="_blank" rel="noreferrer">
                View on explorer
              </a>
            ) : (
              txHash
            )}
          </p>
        )}
        {status === "error" && (
          <p className="mt-2 text-xs text-[#b13636]">
            {error instanceof Error
              ? error.message
              : "Transaction failed. Check wallet for details."}
          </p>
        )}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline text-xs uppercase tracking-[0.25em]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
