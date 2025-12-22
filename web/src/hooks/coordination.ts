import { useMutation } from "@tanstack/react-query"
import { postFiatStatus, type FiatStatusEntry } from "../lib/api"

export const usePostFiatStatus = (escrowId?: string) =>
  useMutation<FiatStatusEntry, Error, { status: string; note?: string }>({
    mutationFn: (payload) => {
      if (!escrowId) {
        return Promise.reject(new Error("missing escrowId"))
      }
      return postFiatStatus(escrowId, payload)
    },
  })
