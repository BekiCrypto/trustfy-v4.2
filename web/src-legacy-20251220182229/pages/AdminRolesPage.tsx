import { useState, type FormEvent } from "react"
import { useAssignRole } from "../hooks/admin"

const roles = ["ADMIN", "ARBITRATOR"] as const

export const AdminRolesPage = () => {
  const [form, setForm] = useState<{ address: string; role: (typeof roles)[number] }>({
    address: "",
    role: roles[0],
  })
  const adminAssign = useAssignRole("ADMIN")
  const arbitratorAssign = useAssignRole("ARBITRATOR")

  const currentMutation = form.role === "ADMIN" ? adminAssign : arbitratorAssign

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.address) return
    currentMutation.mutate({ address: form.address })
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">Roles</p>
        <h1 className="section-title text-slate-950">Allowlists</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Add wallets to ADMIN or ARBITRATOR roles. Backend stores audit logs for privileged actions.
        </p>
      </header>

      <form
        className="card grid gap-4 p-6"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-[color:var(--muted)]">
            Wallet address
            <input
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
              className="input mt-1"
              placeholder="0x..."
            />
          </label>
          <label className="text-sm text-[color:var(--muted)]">
            Role
            <select
              value={form.role}
              onChange={(event) =>
                setForm({ ...form, role: event.target.value as (typeof roles)[number] })
              }
              className="input mt-1"
            >
              {roles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="btn btn-primary w-full text-xs uppercase tracking-[0.3em] disabled:opacity-50"
          type="submit"
          disabled={currentMutation.isPending}
        >
          Save role
        </button>
        {currentMutation.isSuccess && (
          <p className="text-xs text-[color:var(--accent)]">Role saved.</p>
        )}
        {currentMutation.isError && (
          <p className="text-xs text-[#b13636]">Unable to assign role.</p>
        )}
      </form>

      <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-4 text-xs text-[color:var(--muted)]">
        Role listings are managed server-side; use audit logs to track changes.
      </div>
    </section>
  )
}
