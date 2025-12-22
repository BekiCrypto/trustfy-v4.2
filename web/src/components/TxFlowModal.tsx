interface TxFlowModalProps {
  open: boolean
  status: "idle" | "preparing" | "wallet" | "pending" | "confirmed" | "error"
  txHash?: string | null
  explorerUrl?: string
  error?: unknown
  onClose?: () => void
}

export const TxFlowModal = ({ open, status, txHash, explorerUrl, error, onClose }: TxFlowModalProps) => {
  if (!open) return null
  const { t } = useTranslation()

  const stepLabels: Record<TxFlowModalProps["status"], string> = {
    idle: t("txFlow.status.idle"),
    preparing: t("txFlow.status.preparing"),
    wallet: t("txFlow.status.wallet"),
    pending: t("txFlow.status.pending"),
    confirmed: t("txFlow.status.confirmed"),
    error: t("txFlow.status.error"),
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-6 text-sm text-[color:var(--ink)] shadow-[var(--shadow-card)]">
        <p className="eyebrow">{t("txFlow.title")}</p>
        <h2 className="mt-2 text-lg font-semibold">{stepLabels[status]}</h2>
        <p className="mt-2 text-xs text-[color:var(--muted)]">
          {t("txFlow.description")}
        </p>
        {status === "pending" && txHash && (
          <p className="text-xs text-[color:var(--muted)]">
            {t("txFlow.txLabel")}{" "}
            <a href={explorerUrl} className="text-[color:var(--accent-3)] underline" target="_blank" rel="noreferrer">
              {txHash}
            </a>
          </p>
        )}
        {status === "confirmed" && txHash && (
          <p className="text-xs text-[color:var(--muted)]">
            {t("txFlow.confirmedLabel")}{" "}
            {explorerUrl ? (
              <a href={explorerUrl} className="text-[color:var(--accent-3)] underline" target="_blank" rel="noreferrer">
                {t("txFlow.viewOnExplorer")}
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
              : t("txFlow.failedDefault")}
          </p>
        )}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline text-xs uppercase tracking-[0.25em]"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  )
}
import { useTranslation } from "react-i18next"
