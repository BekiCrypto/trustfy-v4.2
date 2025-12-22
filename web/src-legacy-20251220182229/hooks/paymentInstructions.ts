import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchPaymentInstructions, savePaymentInstructions } from "../lib/api"

export const usePaymentInstructions = (escrowId?: string) =>
  useQuery({
    queryKey: ["payment-instructions", escrowId],
    queryFn: () => {
      if (!escrowId) {
        return Promise.resolve(null)
      }
      return fetchPaymentInstructions(escrowId)
    },
    enabled: Boolean(escrowId),
    staleTime: 30_000,
  })

export const useSavePaymentInstructions = (escrowId?: string) => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof savePaymentInstructions>[1]) => {
      if (!escrowId) {
        return Promise.reject(new Error("missing escrow"))
      }
      return savePaymentInstructions(escrowId, payload)
    },
    onSuccess: () => {
      if (!escrowId) return
      client.invalidateQueries({ queryKey: ["payment-instructions", escrowId] })
      client.invalidateQueries({ queryKey: ["escrow", escrowId] })
    },
  })
}
