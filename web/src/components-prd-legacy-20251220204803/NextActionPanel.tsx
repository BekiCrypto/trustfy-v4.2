import type { MouseEventHandler } from "react"
import type { NextAction } from "../hooks/nextAction"

interface NextActionPanelProps {
  actions: NextAction[]
  handlers: Record<
    string,
    {
      onClick: MouseEventHandler<HTMLButtonElement>
      disabled?: boolean
    }
  >
}

const BUTTON_STYLES: Record<NonNullable<NextAction["type"]>, string> = {
  primary: "btn btn-primary text-xs uppercase tracking-[0.25em] disabled:opacity-40",
  secondary: "btn btn-outline text-xs uppercase tracking-[0.25em] disabled:opacity-40",
  danger: "btn btn-danger text-xs uppercase tracking-[0.25em] disabled:opacity-40",
}

const ACTION_HELP: Record<string, string> = {
  take: "Buyer accepts escrow terms and moves it to the next step.",
  fund: "Seller locks funds, fee, and bond on-chain.",
  confirm: "Buyer confirms fiat payment and locks bond.",
  release: "Seller releases crypto to the buyer.",
  dispute: "Open a dispute if terms are not met.",
  resolve: "Arbitrator resolves the dispute on-chain.",
  withdraw: "Admin withdraws platform fees.",
}

export const NextActionPanel = ({ actions, handlers }: NextActionPanelProps) => {
  if (!actions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-4 text-center text-xs text-[color:var(--muted)]">
        No wallet actions available right now.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {actions.map((action) => {
        const handler = handlers[action.id]
        if (!handler) return null
        const style = BUTTON_STYLES[action.type ?? "primary"]
        return (
          <div key={action.id} className="rounded-2xl border border-[color:var(--line)] bg-white/70 p-4">
            <button
              type="button"
              className={style}
              onClick={handler.onClick}
              disabled={handler.disabled}
            >
              {action.label}
            </button>
            <p className="mt-2 text-xs text-[color:var(--muted)]">
              {ACTION_HELP[action.id] ?? "Follow the escrow flow for this step."}
            </p>
          </div>
        )
      })}
    </div>
  )
}
