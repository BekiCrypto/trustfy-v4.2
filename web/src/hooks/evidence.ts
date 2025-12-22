import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchEvidence, commitEvidence } from "../lib/api"

export const useEvidenceList = (escrowId?: string) =>
  useQuery({
    queryKey: ["evidence", escrowId],
    queryFn: () => {
      if (!escrowId) {
        return Promise.resolve([])
      }
      return fetchEvidence(escrowId)
    },
    enabled: Boolean(escrowId),
    staleTime: 30_000,
  })

export const useCommitEvidence = (escrowId?: string) => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof commitEvidence>[1]) => {
      if (!escrowId) {
        return Promise.reject(new Error("missing escrow"))
      }
      return commitEvidence(escrowId, payload)
    },
    onSuccess: () => {
      if (!escrowId) return
      client.invalidateQueries({ queryKey: ["evidence", escrowId] })
    },
  })
}
