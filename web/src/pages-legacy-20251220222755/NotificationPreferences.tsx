import { useEffect, useState } from "react"
import { useNotificationPreferences, useSaveNotificationPreferences } from "../hooks/notifications"

const NotificationPreferencesPage = () => {
  const { data, isLoading } = useNotificationPreferences()
  const savePreferences = useSaveNotificationPreferences()
  const [form, setForm] = useState({
    webhookUrl: "",
    email: "",
    telegramId: "",
    smsNumber: "",
  })

  useEffect(() => {
    if (!data) return
    setForm({
      webhookUrl: data.webhookUrl ?? "",
      email: data.email ?? "",
      telegramId: data.telegramId ?? "",
      smsNumber: data.smsNumber ?? "",
    })
  }, [data])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    savePreferences.mutate({
      webhookUrl: form.webhookUrl || undefined,
      email: form.email || undefined,
      telegramId: form.telegramId || undefined,
      smsNumber: form.smsNumber || undefined,
    })
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">Notifications</p>
        <h1 className="section-title text-[color:var(--ink)]">Preferences</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Configure where Trustfy should send updates about escrow state changes, messages, and disputes.
        </p>
      </header>

      <form className="card grid gap-4 p-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-[color:var(--muted)]">
            Webhook URL
            <input
              className="input mt-1"
              value={form.webhookUrl}
              onChange={(event) => setForm({ ...form, webhookUrl: event.target.value })}
              placeholder="https://hooks.example.com/trustfy"
            />
          </label>
          <label className="text-sm text-[color:var(--muted)]">
            Email
            <input
              className="input mt-1"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="you@example.com"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-[color:var(--muted)]">
            Telegram ID
            <input
              className="input mt-1"
              value={form.telegramId}
              onChange={(event) => setForm({ ...form, telegramId: event.target.value })}
              placeholder="@trustfy_user"
            />
          </label>
          <label className="text-sm text-[color:var(--muted)]">
            SMS Number
            <input
              className="input mt-1"
              value={form.smsNumber}
              onChange={(event) => setForm({ ...form, smsNumber: event.target.value })}
              placeholder="+1 555 123 4567"
            />
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full text-xs uppercase tracking-[0.3em] disabled:opacity-50"
          disabled={savePreferences.isPending}
        >
          {savePreferences.isPending ? "Saving…" : "Save preferences"}
        </button>

        {isLoading && <p className="text-xs text-[color:var(--muted)]">Loading preferences…</p>}
        {savePreferences.isSuccess && (
          <p className="text-xs text-[color:var(--accent)]">Preferences updated.</p>
        )}
        {savePreferences.isError && (
          <p className="text-xs text-[#b13636]">Unable to save preferences.</p>
        )}
      </form>
    </section>
  )
}

export default NotificationPreferencesPage
