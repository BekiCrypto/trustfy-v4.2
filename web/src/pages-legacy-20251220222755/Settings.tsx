import { useAuthContext } from "@/context/AuthContext"
import { useAccount } from "wagmi"

export default function Settings() {
  const { session, isAuthenticating, error } = useAuthContext()
  const { address } = useAccount()

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
          Settings
        </p>
        <h1 className="text-3xl font-semibold text-white">Session & Security</h1>
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm text-slate-400">Wallet Address</p>
        <p className="mt-2 break-all font-mono text-sm text-white">
          {address || "Connect a wallet to view settings."}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm text-slate-400">Auth Status</p>
        <p className="mt-2 text-sm text-slate-200">
          {session ? "Authenticated" : "Not authenticated"}
        </p>
        {isAuthenticating && (
          <p className="mt-2 text-xs text-blue-300">Signing in…</p>
        )}
        {error && (
          <p className="mt-2 text-xs text-red-300">{error}</p>
        )}
      </div>
    </section>
  )
}
