import { useState } from "react"
import { useTokens, useUpsertToken } from "../hooks/admin"

const AdminTokensPage = () => {
  const [form, setForm] = useState({
    chainId: 56,
    tokenKey: "",
    symbol: "",
    name: "",
    decimals: 18,
    enabled: true,
  })
  const [search, setSearch] = useState("")
  const { data: tokens, isLoading } = useTokens()
  const upsert = useUpsertToken()

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">Tokens</p>
        <h1 className="section-title text-[color:var(--ink)]">Token registry</h1>
        <p className="text-sm text-[color:var(--muted)]">
          TokenKey metadata syncs dropdowns and contract flows across chains.
        </p>
      </header>

      <form
        className="card grid gap-4 p-6"
        onSubmit={(event) => {
          event.preventDefault()
          upsert.mutate(form)
        }}
      >
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm text-[color:var(--muted)]">
            Chain ID
            <input
              type="number"
              min="1"
              value={form.chainId}
              onChange={(event) =>
                setForm({ ...form, chainId: Number(event.target.value) })
              }
              className="input mt-1"
            />
          </label>
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
            Symbol
            <input
              value={form.symbol}
              onChange={(event) => setForm({ ...form, symbol: event.target.value })}
              className="input mt-1"
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm text-[color:var(--muted)]">
            Name
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="input mt-1"
            />
          </label>
          <label className="text-sm text-[color:var(--muted)]">
            Decimals
            <input
              type="number"
              min="0"
              value={form.decimals}
              onChange={(event) =>
                setForm({ ...form, decimals: Number(event.target.value) })
              }
              className="input mt-1"
            />
          </label>
          <label className="text-sm text-[color:var(--muted)]">
            Enabled
            <select
              value={form.enabled ? "true" : "false"}
              onChange={(event) =>
                setForm({ ...form, enabled: event.target.value === "true" })
              }
              className="input mt-1"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
        </div>
        <button
          className="btn btn-primary w-full text-xs uppercase tracking-[0.3em] disabled:opacity-50"
          type="submit"
          disabled={upsert.isPending}
        >
          Save token
        </button>
        {upsert.isSuccess && (
          <p className="text-xs text-[color:var(--accent)]">Token saved.</p>
        )}
        {upsert.isError && (
          <p className="text-xs text-[#b13636]">Unable to save token.</p>
        )}
      </form>

      <div className="card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow">Token registry</p>
          <input
            className="input w-full md:w-[280px]"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter by symbol or tokenKey"
          />
        </div>
        {isLoading && <p className="text-sm text-[color:var(--muted)]">Loading tokens…</p>}
        {!isLoading && (!tokens || tokens.length === 0) && (
          <p className="text-sm text-[color:var(--muted)]">No tokens registered yet.</p>
        )}
        {tokens && tokens.length > 0 && (
          <div className="overflow-auto rounded-2xl border border-[color:var(--line)]">
            <table className="table min-w-[680px]">
              <thead>
                <tr>
                  <th>Chain</th>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>TokenKey</th>
                  <th>Decimals</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tokens
                  .filter((token) => {
                    if (!search.trim()) return true
                    const needle = search.toLowerCase()
                    return (
                      token.symbol.toLowerCase().includes(needle) ||
                      token.tokenKey.toLowerCase().includes(needle)
                    )
                  })
                  .map((token) => (
                    <tr key={`${token.chainId}-${token.tokenKey}`}>
                      <td>{token.chainId}</td>
                      <td className="font-semibold text-[color:var(--ink)]">{token.symbol}</td>
                      <td>{token.name}</td>
                      <td className="text-xs">{token.tokenKey}</td>
                      <td>{token.decimals}</td>
                      <td>
                        <span className={`badge-soft ${token.enabled ? "border border-emerald-200 text-emerald-700" : "border border-slate-200 text-slate-500"}`}>
                          {token.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default AdminTokensPage
