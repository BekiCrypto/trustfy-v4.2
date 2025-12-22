import { useState, type ChangeEvent } from "react"
import { useCreateEscrow } from "../hooks/contract"

const defaultValues = {
  escrowId: "",
  buyer: "",
  tokenKey: "",
  amount: "0",
  makerFeeBps: "200",
  takerFeeBps: "200",
  sellerBond: "0",
  buyerBond: "0",
  paymentWindow: "86400",
  releaseWindow: "86400",
}

const templates = [
  {
    id: "quick",
    name: "Quick Trade",
    description: "Standard 24h windows, no bonds",
    values: {
      paymentWindow: "86400",
      releaseWindow: "86400",
    },
    sellerBondPercent: 0,
    buyerBondPercent: 0,
  },
  {
    id: "secure",
    name: "Secure Trade",
    description: "48h windows with 5% bonds",
    values: {
      paymentWindow: "172800",
      releaseWindow: "172800",
    },
    sellerBondPercent: 5,
    buyerBondPercent: 5,
  },
  {
    id: "express",
    name: "Express Trade",
    description: "12h windows, fast turnaround",
    values: {
      paymentWindow: "43200",
      releaseWindow: "43200",
    },
    sellerBondPercent: 0,
    buyerBondPercent: 0,
  },
]

export const CreateEscrowPage = () => {
  const [formValues, setFormValues] = useState(defaultValues)
  const [isNative, setIsNative] = useState(true)
  const [activeTab, setActiveTab] = useState<"template" | "manual">("template")

  const params = {
    escrowId: formValues.escrowId,
    buyer: formValues.buyer,
    tokenKey: formValues.tokenKey,
    isNative,
    amount: BigInt(formValues.amount || "0"),
    makerFeeBps: Number(formValues.makerFeeBps ?? "0"),
    takerFeeBps: Number(formValues.takerFeeBps ?? "0"),
    sellerBond: BigInt(formValues.sellerBond || "0"),
    buyerBond: BigInt(formValues.buyerBond || "0"),
    paymentWindow: Number(formValues.paymentWindow || "0"),
    releaseWindow: Number(formValues.releaseWindow || "0"),
  }

  const createFlow = useCreateEscrow(params)
  const createError =
    createFlow.error instanceof Error ? createFlow.error.message : undefined

  const handleChange =
    (key: keyof typeof defaultValues) => (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((prev) => ({ ...prev, [key]: event.target.value }))
    }

  const applyTemplate = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId)
    if (!template) return
    const amount = Number(formValues.amount || "0")
    const sellerBond = template.sellerBondPercent
      ? Math.floor((amount * template.sellerBondPercent) / 100)
      : 0
    const buyerBond = template.buyerBondPercent
      ? Math.floor((amount * template.buyerBondPercent) / 100)
      : 0
    setFormValues((prev) => ({
      ...prev,
      paymentWindow: template.values.paymentWindow,
      releaseWindow: template.values.releaseWindow,
      sellerBond: sellerBond.toString(),
      buyerBond: buyerBond.toString(),
    }))
    setActiveTab("manual")
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">Create Escrow</p>
        <h1 className="section-title text-slate-950">Seller flow</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Configure terms, fees, and windows for a new escrow.
        </p>
      </header>

      <div className="tabs-list grid-cols-2">
        <button
          type="button"
          className={`tab ${activeTab === "template" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("template")}
        >
          Quick Templates
        </button>
        <button
          type="button"
          className={`tab ${activeTab === "manual" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("manual")}
        >
          Custom Settings
        </button>
      </div>

      {activeTab === "template" && (
        <div className="grid gap-4 md:grid-cols-3">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              className="card-soft hover-lift p-5 text-left"
              onClick={() => applyTemplate(template.id)}
            >
              <p className="eyebrow">{template.name}</p>
              <p className="mt-2 text-sm text-slate-950">{template.description}</p>
              <p className="mt-3 text-xs text-[color:var(--muted)]">
                Payment {template.values.paymentWindow}s · Release {template.values.releaseWindow}s
              </p>
            </button>
          ))}
        </div>
      )}

      {activeTab === "manual" && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            createFlow.execute?.()
          }}
          className="card grid gap-4 p-6"
        >
          <div className="grid gap-2 md:grid-cols-2">
            <label className="text-sm font-semibold text-[color:var(--muted)]">
              Escrow ID
              <input
                value={formValues.escrowId}
                onChange={handleChange("escrowId")}
                className="input mt-1"
                placeholder="0x..."
                required
              />
            </label>
            <label className="text-sm font-semibold text-[color:var(--muted)]">
              Buyer address
              <input
                value={formValues.buyer}
                onChange={handleChange("buyer")}
                className="input mt-1"
                placeholder="0x..."
                required
              />
            </label>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <label className="text-sm font-semibold text-[color:var(--muted)]">
              TokenKey
              <input
                value={formValues.tokenKey}
                onChange={handleChange("tokenKey")}
                className="input mt-1"
                placeholder="0x000... or 0x0000"
                required={!isNative}
              />
            </label>
            <label className="text-sm font-semibold text-[color:var(--muted)]">
              Amount (base units)
              <input
                value={formValues.amount}
                onChange={handleChange("amount")}
                className="input mt-1"
                type="number"
                min="1"
                required
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--muted)]">
            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.3em]">
              <input
                type="checkbox"
                checked={isNative}
                onChange={(event) => setIsNative(event.target.checked)}
                className="rounded border-[color:var(--line)] accent-[color:var(--accent)]"
              />
              Native Token
            </label>
            <p>
              For native flows leave TokenKey blank; for ERC20 supply contract address.
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <label className="text-sm font-semibold text-[color:var(--muted)]">
              Maker fee (bps)
              <input
                value={formValues.makerFeeBps}
                onChange={handleChange("makerFeeBps")}
                className="input mt-1"
                type="number"
                min="0"
              />
            </label>
            <label className="text-sm font-semibold text-[color:var(--muted)]">
              Taker fee (bps)
              <input
                value={formValues.takerFeeBps}
                onChange={handleChange("takerFeeBps")}
                className="input mt-1"
                type="number"
                min="0"
              />
            </label>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <label className="text-sm font-semibold text-[color:var(--muted)]">
              Seller Bond
              <input
                value={formValues.sellerBond}
                onChange={handleChange("sellerBond")}
                className="input mt-1"
                type="number"
                min="0"
              />
            </label>
            <label className="text-sm font-semibold text-[color:var(--muted)]">
              Buyer Bond
              <input
                value={formValues.buyerBond}
                onChange={handleChange("buyerBond")}
                className="input mt-1"
                type="number"
                min="0"
              />
            </label>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <label className="text-sm font-semibold text-[color:var(--muted)]">
              Payment window (seconds)
              <input
                value={formValues.paymentWindow}
                onChange={handleChange("paymentWindow")}
                className="input mt-1"
                type="number"
                min="60"
              />
            </label>
            <label className="text-sm font-semibold text-[color:var(--muted)]">
              Release window (seconds)
              <input
                value={formValues.releaseWindow}
                onChange={handleChange("releaseWindow")}
                className="input mt-1"
                type="number"
                min="60"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-[color:var(--line)] bg-white/70 p-4 text-xs text-[color:var(--muted)]">
            Platform fees: maker {formValues.makerFeeBps} bps · taker {formValues.takerFeeBps} bps
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="submit"
              disabled={createFlow.status !== "idle"}
              className="btn btn-primary text-xs uppercase tracking-[0.3em] disabled:opacity-50"
            >
              {createFlow.status === "pending" ? "Creating…" : "Create Escrow on-chain"}
            </button>
            {createFlow.status === "error" && (
              <span className="text-xs text-[#b13636]">
                {createError ?? "Action failed, confirm wallet interaction."}
              </span>
            )}
            {createFlow.status === "confirmed" && (
              <span className="text-xs text-[color:var(--accent)]">Transaction confirmed</span>
            )}
          </div>
        </form>
      )}
    </section>
  )
}
