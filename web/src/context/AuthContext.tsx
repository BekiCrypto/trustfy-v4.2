import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { PropsWithChildren } from "react"
import { useAccount, useSignMessage } from "wagmi"
import type { AuthSession } from "@trustfy/shared"
import { loginWithSignature, logout as apiLogout, requestNonce } from "../lib/api"
import { sessionStore } from "../lib/session"

/* eslint-disable react-refresh/only-export-components */

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticating: boolean
  error?: string | null
  logout: () => Promise<void>
  reauthenticate: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const isSessionActive = (session: AuthSession | null, address?: string) => {
  if (!session || !address) return false
  if (session.address.toLowerCase() !== address.toLowerCase()) return false
  if (!session.expiresAt) return true
  return new Date(session.expiresAt).getTime() > Date.now()
}

export const AuthProvider = ({ children }: PropsWithChildren<unknown>) => {
  const { address, isConnected, chainId } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const [session, setSession] = useState<AuthSession | null>(() =>
    sessionStore.get()
  )
  const [isAuthenticating, setAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // ignore
    }
    sessionStore.clear()
    setSession(null)
  }, [])

  const executeLogin = useCallback(async () => {
    if (!address || !isConnected || !chainId) return

    const stored = sessionStore.get()
    if (isSessionActive(stored, address)) {
      setSession(stored)
      return
    }

    setAuthenticating(true)
    setError(null)

    try {
      const domain =
        import.meta.env.VITE_AUTH_DOMAIN ??
        (typeof window !== "undefined"
          ? window.location.host
          : "trustfy.io")

      const noncePayload = await requestNonce({
        address,
        chainId,
        domain,
      })

      const signature = await signMessageAsync({
        message: noncePayload.message,
      })

      const authSession = await loginWithSignature({
        address,
        nonce: noncePayload.nonce,
        signature,
      })

      sessionStore.set(authSession)
      setSession(authSession)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to authenticate with Trustfy API"
      setError(message)
    } finally {
      setAuthenticating(false)
    }
  }, [address, chainId, isConnected, signMessageAsync])

  useEffect(() => {
    if (!isConnected || !address) {
      if (session) {
        sessionStore.clear()
        setSession(null)
      }
      return
    }

    const stored = sessionStore.get()
    if (stored && isSessionActive(stored, address)) {
      if (!session || session.accessToken !== stored.accessToken) {
        setSession(stored)
      }
    }
  }, [address, chainId, executeLogin, isConnected, session])

  const contextValue = useMemo(
    () => ({
      session,
      isAuthenticating,
      error,
      logout: handleLogout,
      reauthenticate: executeLogin,
    }),
    [session, isAuthenticating, error, handleLogout, executeLogin]
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
