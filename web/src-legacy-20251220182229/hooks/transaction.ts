import type { Abi, Address } from "viem"
import { useCallback, useMemo, useState } from "react"
import { useAccount, useChainId, usePublicClient, useWriteContract } from "wagmi"

export type TxFlowStatus =
  | "idle"
  | "preparing"
  | "wallet"
  | "pending"
  | "confirmed"
  | "error"

interface TxFlowOptions {
  abi: Abi
  functionName: string
  address?: Address
  args?: readonly unknown[]
  enabled?: boolean
}

export const useTxFlow = (options: TxFlowOptions) => {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient({ chainId })
  const { writeContractAsync } = useWriteContract()

  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [phase, setPhase] = useState<TxFlowStatus>("idle")

  const enabled =
    options.enabled !== false &&
    Boolean(options.address) &&
    Boolean(options.args) &&
    isConnected

  const execute = useCallback(async (override?: { args?: readonly unknown[] }) => {
    const args = override?.args ?? options.args
    if (!enabled || !options.address || !args) {
      return
    }
    if (!publicClient) {
      setError(new Error("No public client available"))
      setPhase("error")
      return
    }

    setError(null)
    setPhase("preparing")

    try {
      setPhase("wallet")

      const hash = await writeContractAsync({
        abi: options.abi,
        address: options.address,
        functionName: options.functionName,
        args,
        chainId,
      })

      setTxHash(hash)
      setPhase("pending")

      await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1,
      })

      setPhase("confirmed")
    } catch (err) {
      setError(err)
      setPhase("error")
      throw err
    }
  }, [
    enabled,
    options.address,
    options.args,
    options.abi,
    options.functionName,
    writeContractAsync,
    publicClient,
    chainId,
  ])

  const status: TxFlowStatus = useMemo(() => {
    if (!enabled) return "idle"
    return phase
  }, [enabled, phase])

  return {
    execute,
    status,
    txHash,
    error,
    isPreparing: phase === "preparing",
  }
}
