import { Link } from "react-router-dom"

export const NotFoundPage = () => (
  <section className="card fade-in space-y-4 p-6 text-center">
    <h1 className="text-4xl font-semibold text-slate-950">Page not found</h1>
    <p className="text-sm text-[color:var(--muted)]">The route you requested does not exist.</p>
    <Link
      to="/"
      className="btn btn-outline text-xs uppercase tracking-[0.3em]"
    >
      Return home
    </Link>
  </section>
)
