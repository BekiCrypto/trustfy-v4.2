export const TermsPage = () => {
  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">Legal</p>
        <h1 className="section-title text-slate-950">Terms of Service</h1>
        <p className="text-sm text-[color:var(--muted)]">
          These terms describe how Trustfy operates as a non-custodial escrow coordination platform.
        </p>
      </header>

      <div className="card p-6 space-y-4 text-sm text-[color:var(--muted)]">
        <p>
          Trustfy provides tools to create, take, fund, and resolve escrows via a deployed smart contract.
          We never custody user funds and we never sign transactions on behalf of users.
        </p>
        <p>
          Users are responsible for verifying escrow terms, counterparties, and any off-chain payment instructions.
          Trustfy does not guarantee outcomes or reimburse losses.
        </p>
        <p>
          Disputes are resolved by arbitrators. Arbitration outcomes are executed on-chain and are final.
        </p>
        <p>
          By using this platform you agree to comply with applicable laws and regulations in your jurisdiction.
        </p>
      </div>
    </section>
  )
}
