import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  fetchAdminPools,
  fetchAdminTokens,
  postAdminRole,
  postAdminToken,
  postAdminWithdraw,
  postArbitratorRole,
} from "../lib/api"
import type { AdminPool, TokenRegistryEntry } from "@trustfy/shared"

export const useAdminPools = (tokenKey?: string) =>
  useQuery<AdminPool[], Error>({
    queryKey: ["admin", "pools", tokenKey ?? "all"],
    queryFn: () => fetchAdminPools(tokenKey),
    staleTime: 30_000,
  })

export const useWithdrawPlatform = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof postAdminWithdraw>[0]) =>
      postAdminWithdraw(payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["admin", "pools"] })
    },
  })
}

export const useTokens = () =>
  useQuery<TokenRegistryEntry[], Error>({
    queryKey: ["admin", "tokens"],
    queryFn: () => fetchAdminTokens(),
    staleTime: 30_000,
  })

export const useUpsertToken = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof postAdminToken>[0]) =>
      postAdminToken(payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["admin", "tokens"] })
    },
  })
}

export const useAssignRole = (role: "ADMIN" | "ARBITRATOR") => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof postAdminRole>[0]) => {
      return role === "ADMIN"
        ? postAdminRole(payload)
        : postArbitratorRole(payload)
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["admin", "roles"] })
    },
  })
}
