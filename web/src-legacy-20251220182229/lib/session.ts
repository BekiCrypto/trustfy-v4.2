import type { AuthSession } from "@trustfy/shared"

const STORAGE_KEY = "trustfy-auth-session"

const readStorage = (): AuthSession | null => {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthSession
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export const sessionStore = {
  get: (): AuthSession | null => {
    return readStorage()
  },
  set: (session: AuthSession | null) => {
    if (typeof window === "undefined") return
    if (!session) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  },
  clear: () => {
    if (typeof window === "undefined") return
    window.localStorage.removeItem(STORAGE_KEY)
  },
}
