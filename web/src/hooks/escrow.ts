import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  fetchEscrowById,
  fetchEscrows,
  fetchEscrowTimeline,
  fetchIndexerStatus,
  fetchMessages,
  sendMessage,
} from "../lib/api"
import type {
  EscrowDetail,
  EscrowTimelineEntry,
  IndexerStatus,
  MessageItem,
} from "@trustfy/shared"

type EscrowListResponse = Awaited<ReturnType<typeof fetchEscrows>>

export const useEscrows = (params: Parameters<typeof fetchEscrows>[0]) =>
  useQuery<EscrowListResponse, Error>({
    queryKey: ["escrows", params],
    queryFn: () => fetchEscrows(params),
    staleTime: 30_000,
  })

export const useEscrow = (escrowId?: string) =>
  useQuery<EscrowDetail, Error>({
    queryKey: ["escrow", escrowId],
    queryFn: () => {
      if (!escrowId) return Promise.reject(new Error("missing escrowId"))
      return fetchEscrowById(escrowId)
    },
    enabled: Boolean(escrowId),
  })

export const useEscrowTimeline = (escrowId?: string) =>
  useQuery<EscrowTimelineEntry[], Error>({
    queryKey: ["timeline", escrowId],
    queryFn: () => {
      if (!escrowId) return Promise.reject(new Error("missing escrowId"))
      return fetchEscrowTimeline(escrowId)
    },
    enabled: Boolean(escrowId),
  })

export const useMessages = (escrowId?: string) =>
  useQuery<MessageItem[], Error>({
    queryKey: ["messages", escrowId],
    queryFn: () => {
      if (!escrowId) return Promise.reject(new Error("missing escrowId"))
      return fetchMessages(escrowId)
    },
    enabled: Boolean(escrowId),
  })

export const useSendMessage = (escrowId?: string) => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: { text: string; attachmentUri?: string }) => {
      if (!escrowId) return Promise.reject(new Error("missing escrowId"))
      return sendMessage(escrowId, payload)
    },
    onSuccess: () => {
      if (escrowId) {
        client.invalidateQueries({ queryKey: ["messages", escrowId] })
      }
    },
  })
}

export const useIndexerStatus = () =>
  useQuery<IndexerStatus[], Error>({
    queryKey: ["indexer", "status"],
    queryFn: fetchIndexerStatus,
    staleTime: 60_000,
  })
