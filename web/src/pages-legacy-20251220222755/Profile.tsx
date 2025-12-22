import { useAccount } from "wagmi"
import { useAuthContext } from "@/context/AuthContext"
import { Link } from "react-router-dom"

export default function Profile() {
  const { address } = useAccount()
  const { session } = useAuthContext()

  const roles = session?.roles ?? []

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
          Profile
        </p>
        <h1 className="text-3xl font-semibold text-white">Wallet Profile</h1>
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm text-slate-400">Connected Address</p>
        <p className="mt-2 break-all font-mono text-sm text-white">
          {address || "Connect a wallet to view your profile."}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm text-slate-400">Roles</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {roles.length === 0 ? (
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              USER
            </span>
          ) : (
            roles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-blue-600/20 px-3 py-1 text-xs text-blue-200"
              >
                {role}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm text-slate-400">Preferences</p>
        <p className="mt-2 text-sm text-slate-300">
          Manage alerts and notification channels.
        </p>
        <Link
          to="/app/notifications"
          className="mt-4 inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200 hover:bg-slate-800"
        >
          Notification Preferences
        </Link>
      </div>
    </section>
  )
}
