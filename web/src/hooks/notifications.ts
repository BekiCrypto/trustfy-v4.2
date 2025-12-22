import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  fetchNotificationPreferences,
  saveNotificationPreferences,
} from "../lib/api"
import { sessionStore } from "../lib/session"

export const useNotificationPreferences = () =>
  useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: fetchNotificationPreferences,
    staleTime: 60_000,
    enabled: Boolean(sessionStore.get()?.accessToken),
  })

export const useSaveNotificationPreferences = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: saveNotificationPreferences,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["notifications", "preferences"] })
    },
  })
}
