import clsx from "clsx"

const STATE_STYLES: Record<string, { label: string; className: string }> = {
  CREATED: {
    label: "Created",
    className: "bg-slate-800/70 text-slate-200 border border-slate-600/60",
  },
  TAKEN: {
    label: "Taken",
    className: "bg-blue-500/20 text-blue-200 border border-blue-500/50",
  },
  FUNDED: {
    label: "Funded",
    className: "bg-purple-500/20 text-purple-200 border border-purple-500/50",
  },
  PAYMENT_CONFIRMED: {
    label: "Payment Confirmed",
    className: "bg-indigo-500/20 text-indigo-200 border border-indigo-500/50",
  },
  DISPUTED: {
    label: "Disputed",
    className: "bg-orange-500/20 text-orange-200 border border-orange-500/50",
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/50",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-500/20 text-red-200 border border-red-500/50",
  },
}

export const StateBadge = ({ state }: { state?: string | null }) => {
  const config = STATE_STYLES[state ?? "CREATED"] ?? STATE_STYLES.CREATED
  return (
    <span className={clsx("badge-soft", config.className)}>
      {config.label}
    </span>
  )
}
