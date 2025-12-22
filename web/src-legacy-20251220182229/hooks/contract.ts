import { useMemo } from "react"
import { useChainId } from "wagmi"
import { useTxFlow } from "./transaction"
import { escrowAbi, selectEscrowAddress } from "../lib/contract"

const useEscrowTx = (
  functionName:
    | "createEscrow"
    | "takeEscrow"
    | "fundEscrow"
    | "confirmPayment"
    | "releaseEscrow"
    | "openDispute"
    | "resolveDispute"
    | "withdrawPlatform",
  args?: readonly unknown[]
) => {
  const chainId = useChainId()
  const contractAddress = useMemo(() => {
    if (!chainId) return undefined
    return selectEscrowAddress(chainId)
  }, [chainId])

  return useTxFlow({
    abi: escrowAbi,
    functionName: functionName as string,
    args,
    address: contractAddress,
    enabled: Boolean(contractAddress) && Boolean(args),
  })
}

export const useCreateEscrow = (params: {
  escrowId: string
  buyer: string
  tokenKey: string
  isNative: boolean
  amount: bigint
  makerFeeBps: number
  takerFeeBps: number
  sellerBond: bigint
  buyerBond: bigint
  paymentWindow: number
  releaseWindow: number
}) =>
  useEscrowTx("createEscrow", [
    {
      escrowId: params.escrowId,
      buyer: params.buyer,
      tokenKey: params.tokenKey,
      isNative: params.isNative,
      amount: params.amount,
      makerFeeBps: params.makerFeeBps,
      takerFeeBps: params.takerFeeBps,
      sellerBond: params.sellerBond,
      buyerBond: params.buyerBond,
      paymentWindow: params.paymentWindow,
      releaseWindow: params.releaseWindow,
    },
  ])

export const useTakeEscrow = (escrowId?: string) =>
  useEscrowTx("takeEscrow", escrowId ? [escrowId] : undefined)

export const useFundEscrow = (escrowId?: string) =>
  useEscrowTx(
    "fundEscrow",
    escrowId ? [escrowId, "0x0" as `0x${string}`] : undefined
  )

export const useConfirmPayment = (escrowId?: string) =>
  useEscrowTx(
    "confirmPayment",
    escrowId ? [escrowId, "0x0" as `0x${string}`] : undefined
  )

export const useReleaseEscrow = (escrowId?: string) =>
  useEscrowTx(
    "releaseEscrow",
    escrowId ? [escrowId, "0x0" as `0x${string}`] : undefined
  )

export const useOpenDispute = (escrowId?: string) =>
  useEscrowTx("openDispute", escrowId ? [escrowId] : undefined)

export const useResolveDispute = (escrowId?: string, outcome?: number) =>
  useEscrowTx(
    "resolveDispute",
    escrowId
      ? [escrowId, outcome ?? 0, "0x0" as `0x${string}`]
      : undefined
  )

export const useWithdrawPlatform = (
  tokenKey?: string,
  feeAmount?: bigint,
  bondAmount?: bigint
) =>
  useEscrowTx(
    "withdrawPlatform",
    tokenKey ? [tokenKey, feeAmount ?? 0n, bondAmount ?? 0n] : undefined
  )
