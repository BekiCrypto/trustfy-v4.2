import { useMutation, useQuery } from "@tanstack/react-query"
import { fetchDisputeDetail, fetchDisputes, openDisputeCase } from "../lib/api"
import type { DisputeDetail, DisputeSummary } from "@trustfy/shared"

export const useDisputes = (status?: string) =>
  useQuery<DisputeSummary[], Error>({
    queryKey: ["disputes", status],
    queryFn: () => fetchDisputes({ status }),
    staleTime: 30_000,
  })

export const useDisputeDetail = (escrowId?: string) =>
  useQuery<DisputeDetail, Error>({
    queryKey: ["dispute", escrowId],
    queryFn: () => {
      if (!escrowId) {
        return Promise.reject(new Error("missing escrow"))
      }
      return fetchDisputeDetail(escrowId)
    },
    enabled: Boolean(escrowId),
    staleTime: 30_000,
    retry: false,
  })

export const useOpenDisputeCase = (escrowId?: string) =>
  useMutation<DisputeSummary, Error, { reasonCode: string; summary?: string }>({
    mutationFn: (payload) => {
      if (!escrowId) {
        return Promise.reject(new Error("missing escrowId"))
      }
      return openDisputeCase(escrowId, payload)
    },
  })
