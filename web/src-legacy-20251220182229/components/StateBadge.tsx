import clsx from "clsx"

const STATE_STYLES: Record<string, { label: string; className: string }> = {
  CREATED: {
    label: "Created",
    className: "bg-slate-100 text-slate-700 border border-slate-300",
  },
  TAKEN: {
    label: "Taken",
    className: "bg-blue-100 text-blue-700 border border-blue-300",
  },
  FUNDED: {
    label: "Funded",
    className: "bg-purple-100 text-purple-700 border border-purple-300",
  },
  PAYMENT_CONFIRMED: {
    label: "Payment Confirmed",
    className: "bg-indigo-100 text-indigo-700 border border-indigo-300",
  },
  DISPUTED: {
    label: "Disputed",
    className: "bg-orange-100 text-orange-700 border border-orange-300",
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 border border-red-300",
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
