import { useConnect, useAccount, useDisconnect } from "wagmi"
import clsx from "clsx"
import { useAuthContext } from "../context/AuthContext"

const truncateAddress = (address: string) =>
  `${address.slice(0, 6)}…${address.slice(-4)}`

export const WalletConnectButton = () => {
  const { connectors, mutateAsync, status } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { session, isAuthenticating, logout } = useAuthContext()

  if (isConnected && address) {
    const handleDisconnect = async () => {
      await logout().catch(() => {
        /** best effort */
      })
      disconnect()
    }

    const roleLabel =
      session?.roles.length && session.roles.length > 0
        ? session.roles.join(", ")
        : isAuthenticating
        ? "authenticating…"
        : "awaiting session"

    return (
      <div className="flex items-center gap-3">
        <span className="pill">
          {truncateAddress(address)}
        </span>
        <span className="text-xs text-[color:var(--muted)]">{roleLabel}</span>
        <button
          className="btn btn-outline text-xs uppercase tracking-[0.25em]"
          onClick={handleDisconnect}
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          disabled={!connector.ready || status === "pending"}
          className={clsx(
            "btn text-xs uppercase tracking-[0.25em]",
            connector.ready
              ? "btn-primary"
              : "cursor-not-allowed border border-[color:var(--line)] text-[color:var(--muted)]"
          )}
          onClick={() => mutateAsync({ connector })}
        >
          {connector.name}
        </button>
      ))}
    </div>
  )
}
