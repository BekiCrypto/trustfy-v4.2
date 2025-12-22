import { Link } from "react-router-dom"

export const LandingPage = () => {
  return (
    <section className="space-y-16">
      <header className="card fade-in overflow-hidden p-8 md:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="badge-soft">Secure P2P trading on BSC</div>
            <h1 className="text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
              Trustfy escrow platform for real-world trades
            </h1>
            <p className="text-lg text-[color:var(--muted)]">
              Non-custodial escrow with contract-aligned states and real-time indexing. Every trade is backed by on-chain truth, evidence storage, and role-based dispute resolution.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/explore" className="btn btn-primary text-xs uppercase tracking-[0.3em]">
                Explore Escrows
              </Link>
              <Link to="/app/create" className="btn btn-outline text-xs uppercase tracking-[0.3em]">
                Create Escrow
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-[color:var(--muted)]">
              <span className="pill">2% Platform Fee</span>
              <span className="pill">Arbitrator Ready</span>
              <span className="pill">Evidence Vault</span>
            </div>
          </div>
          <div className="rounded-[26px] border border-[color:var(--line)] bg-gradient-to-br from-white/90 via-white to-blue-50 p-6 shadow-[var(--shadow-soft)]">
            <p className="eyebrow">Live platform snapshot</p>
            <div className="mt-4 space-y-3">
              {[
                { label: "Lifecycle enforcement", value: "On-chain" },
                { label: "Dispute readiness", value: "Arbitrator ready" },
                { label: "Evidence storage", value: "MinIO/S3" },
                { label: "Indexing health", value: "Reorg safe" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3 text-sm">
                  <span className="text-[color:var(--muted)]">{item.label}</span>
                  <span className="badge">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="space-y-8">
        <div className="text-center">
          <p className="eyebrow">Why Trustfy</p>
          <h2 className="text-3xl font-semibold text-slate-950">Premium escrow UX</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            Built for operational marketplaces with real-time indexing, dispute tooling, and secure escrow flows.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "On-chain truth",
              description: "Read models only reflect contract events and state transitions.",
            },
            {
              title: "Non-custodial",
              description: "All contract writes are wallet-signed by participants or arbitrators.",
            },
            {
              title: "Dispute-ready",
              description: "Evidence, chat, and resolution flows aligned to contract semantics.",
            },
            {
              title: "Role-aware",
              description: "Seller, buyer, arbitrator, and admin journeys stay in sync.",
            },
          ].map((feature, index) => (
            <article key={feature.title} className={`card-soft hover-lift p-5 fade-in stagger-${index + 1}`}>
              <h3 className="text-lg font-semibold text-slate-950">{feature.title}</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card p-8 md:p-12">
        <div className="text-center">
          <p className="eyebrow">How it works</p>
          <h2 className="text-3xl font-semibold text-slate-950">Five-step escrow flow</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {[
            "Create escrow",
            "Buyer takes",
            "Seller funds",
            "Buyer confirms",
            "Seller releases",
          ].map((step, index) => (
            <div key={step} className="rounded-2xl border border-[color:var(--line)] bg-white/80 p-4 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {index + 1}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-950">{step}</p>
              <p className="mt-2 text-xs text-[color:var(--muted)]">Aligned to on-chain state.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card-soft p-5">
          <p className="eyebrow">Public access</p>
          <h3 className="text-lg font-semibold text-slate-950">Explore created ads</h3>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Anyone can browse CREATED escrows without a wallet. Connect only when you want to take or create an escrow.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="pill">Explore</span>
            <span className="pill">Created only</span>
          </div>
        </article>
        <article className="card-soft p-5">
          <p className="eyebrow">Participants</p>
          <h3 className="text-lg font-semibold text-slate-950">Buyers & sellers</h3>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Wallet connection unlocks escrow creation, funding, payment confirmation, and dispute initiation.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="pill">Create Escrow</span>
            <span className="pill">My Escrows</span>
            <span className="pill">Notifications</span>
          </div>
        </article>
        <article className="card-soft p-5">
          <p className="eyebrow">Privileged roles</p>
          <h3 className="text-lg font-semibold text-slate-950">Arbitrator & admin</h3>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Arbitrators resolve disputes on-chain, admins manage pools, tokens, and roles.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="pill">Arbitration</span>
            <span className="pill">Admin Console</span>
          </div>
        </article>
      </section>

      <section className="card p-8 md:p-12">
        <div className="text-center">
          <p className="eyebrow">State model</p>
          <h2 className="text-3xl font-semibold text-slate-950">Canonical escrow states</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            UI, API, and contract lifecycle use the same enum to prevent mismatches.
          </p>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-4">
          {[
            "CREATED",
            "TAKEN",
            "FUNDED",
            "PAYMENT_CONFIRMED",
            "DISPUTED",
            "RESOLVED",
            "CANCELLED",
          ].map((state) => (
            <div key={state} className="rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3 text-sm font-semibold text-slate-950">
              {state}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-10 text-white">
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-semibold">Ready to trade with confidence?</h2>
          <p className="text-sm text-blue-100">
            Connect your wallet, create an escrow, and let the smart contract protect the trade.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/explore" className="btn btn-outline text-xs uppercase tracking-[0.3em] text-white">
              Browse Escrows
            </Link>
            <Link to="/app/create" className="btn btn-primary text-xs uppercase tracking-[0.3em]">
              Launch Escrow
            </Link>
          </div>
        </div>
      </section>
    </section>
  )
}
