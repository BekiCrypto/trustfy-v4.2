const FAQS = [
  {
    q: "Do I need a wallet to browse escrows?",
    a: "No. Public CREATED escrows are visible without connecting a wallet. Wallet connection is required for actions.",
  },
  {
    q: "Who holds the funds during escrow?",
    a: "Funds are locked in the smart contract. Trustfy never takes custody.",
  },
  {
    q: "What happens if there is a dispute?",
    a: "A dispute can be opened by participants. An arbitrator resolves it on-chain.",
  },
  {
    q: "What are the platform fees?",
    a: "Platform fees are configured per escrow and shown before funding.",
  },
  {
    q: "How is evidence handled?",
    a: "Evidence files are uploaded to object storage and verified with hashes.",
  },
]

export const FaqPage = () => {
  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">Support</p>
        <h1 className="section-title text-slate-950">FAQ</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Common questions about Trustfy escrow, roles, and dispute handling.
        </p>
      </header>

      <div className="space-y-3">
        {FAQS.map((item) => (
          <article key={item.q} className="card-soft p-5">
            <p className="text-sm font-semibold text-slate-950">{item.q}</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{item.a}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
