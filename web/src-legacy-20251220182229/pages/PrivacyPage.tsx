export const PrivacyPage = () => {
  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">Legal</p>
        <h1 className="section-title text-slate-950">Privacy Policy</h1>
        <p className="text-sm text-[color:var(--muted)]">
          This policy explains what data Trustfy stores and how it is used.
        </p>
      </header>

      <div className="card p-6 space-y-4 text-sm text-[color:var(--muted)]">
        <p>
          Trustfy stores wallet addresses, escrow metadata, messages, evidence references, and dispute records
          required to operate the platform and comply with audit requirements.
        </p>
        <p>
          Evidence files are stored in object storage and referenced by URI and hash for integrity checks.
          We do not store private keys or perform server-side signing.
        </p>
        <p>
          Notification preferences are optional and may include webhook URLs, email addresses, Telegram IDs,
          or SMS numbers provided by users.
        </p>
        <p>
          We do not sell user data. Data may be disclosed when required by law or to prevent fraud and abuse.
        </p>
      </div>
    </section>
  )
}
