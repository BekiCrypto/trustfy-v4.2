import axios, { AxiosHeaders } from "axios"
import type {
  AdminPool,
  AuthSession,
  DisputeDetail,
  DisputeSummary,
  EvidenceEntry,
  EscrowDetail,
  EscrowSummary,
  EscrowTimelineEntry,
  IndexerStatus,
  MessageItem,
  PaymentInstruction,
  TokenRegistryEntry,
} from "@trustfy/shared"
import { API_BASE_URL } from "./config"
import { sessionStore } from "./session"

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

http.interceptors.request.use((config) => {
  const session = sessionStore.get()
  if (session?.accessToken) {
    const headers = AxiosHeaders.from(config.headers ?? {})
    headers.set("Authorization", `Bearer ${session.accessToken}`)
    config.headers = headers
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStore.clear()
    }
    const message =
      error.response?.data?.message ?? error.message ?? "Unexpected error"
    return Promise.reject(new Error(message))
  }
)

export const fetchEscrows = async (params: {
  status?: string
  tokenKey?: string
  role?: "seller" | "buyer"
  page?: number
  pageSize?: number
}): Promise<{ items: EscrowSummary[]; meta: { total: number } }> => {
  const response = await http.get("/v1/escrows", { params })
  return response.data
}

export const fetchEscrowById = async (
  escrowId: string
): Promise<EscrowDetail> => {
  const response = await http.get(`/v1/escrows/${escrowId}`)
  return response.data
}

export const fetchEscrowTimeline = async (
  escrowId: string
): Promise<EscrowTimelineEntry[]> => {
  const response = await http.get(`/v1/escrows/${escrowId}/timeline`)
  return response.data
}

export const fetchMessages = async (
  escrowId: string
): Promise<MessageItem[]> => {
  const response = await http.get(`/v1/escrows/${escrowId}/messages`)
  return response.data
}

export const sendMessage = async (
  escrowId: string,
  payload: { text: string; attachmentUri?: string }
): Promise<MessageItem> => {
  const response = await http.post(`/v1/escrows/${escrowId}/messages`, payload)
  return response.data
}

export const fetchDisputes = async (params?: { status?: string }) => {
  const response = await http.get<DisputeSummary[]>("/v1/disputes", { params })
  return response.data
}

export const fetchIndexerStatus = async (): Promise<IndexerStatus[]> => {
  const response = await http.get<IndexerStatus[]>("/v1/indexer/status")
  return response.data
}

export const fetchNotificationsHealth = async (): Promise<{ status: string }> => {
  const response = await http.get<{ status: string }>("/v1/notifications/health")
  return response.data
}

export const fetchNotificationPreferences = async () => {
  const response = await http.get("/v1/notifications/preferences")
  return response.data
}

export const saveNotificationPreferences = async (payload: {
  webhookUrl?: string
  email?: string
  telegramId?: string
  smsNumber?: string
}) => {
  const response = await http.post("/v1/notifications/preferences", payload)
  return response.data
}

export interface AuthNonceResponse {
  nonce: string
  message: string
  expiresAt: string
  issuedAt: string
  domain: string
  chainId: number
}

export interface AuthLoginParams {
  address: string
  nonce: string
  signature: string
}

export const requestNonce = (payload: {
  address: string
  chainId: number
  domain?: string
}): Promise<AuthNonceResponse> =>
  http.post("/v1/auth/nonce", payload).then((response) => response.data)

export const loginWithSignature = (
  payload: AuthLoginParams
): Promise<AuthSession> =>
  http
    .post<AuthSession>("/v1/auth/login", payload)
    .then((response) => response.data)

export const logout = () => http.post("/v1/auth/logout")

export const fetchEvidence = async (escrowId: string): Promise<EvidenceEntry[]> => {
  const response = await http.get(`/v1/escrows/${escrowId}/evidence`)
  return response.data
}

export interface EvidencePresignPayload {
  filename: string
  size: number
  mime: string
  sha256: string
}

export interface EvidencePresignResponse {
  uploadUrl: string
  key: string
  uri: string
  expiresAt: string
}

export const presignEvidence = async (
  escrowId: string,
  payload: EvidencePresignPayload
): Promise<EvidencePresignResponse> => {
  const response = await http.post(`/v1/escrows/${escrowId}/evidence/presign`, payload)
  return response.data
}

export interface EvidenceCommitPayload {
  uri?: string
  key?: string
  sha256: string
  mime: string
  size: number
  description?: string
}

export const commitEvidence = async (
  escrowId: string,
  payload: EvidenceCommitPayload
): Promise<EvidenceEntry> => {
  const response = await http.post(`/v1/escrows/${escrowId}/evidence/commit`, payload)
  return response.data
}

export const fetchPaymentInstructions = async (
  escrowId: string
): Promise<PaymentInstruction | null> => {
  const response = await http.get<PaymentInstruction | null>(
    `/v1/escrows/${escrowId}/payment-instructions`
  )
  return response.data
}

export const savePaymentInstructions = async (
  escrowId: string,
  payload: { contentJson: Record<string, unknown> }
): Promise<PaymentInstruction> => {
  const response = await http.post(`/v1/escrows/${escrowId}/payment-instructions`, payload)
  return response.data
}

export const openDisputeCase = async (
  escrowId: string,
  payload: { reasonCode: string; summary?: string }
): Promise<DisputeSummary> => {
  const response = await http.post(`/v1/escrows/${escrowId}/dispute/open`, payload)
  return response.data
}

export const fetchDisputeDetail = async (escrowId: string): Promise<DisputeDetail> => {
  const response = await http.get<DisputeDetail>(`/v1/disputes/${escrowId}`)
  return response.data
}

export const submitDisputeRecommendation = async (
  escrowId: string,
  payload: { note: string; summary?: string }
): Promise<DisputeSummary> => {
  const response = await http.post(`/v1/disputes/${escrowId}/recommendation`, payload)
  return response.data
}

export const submitDisputeResolve = async (
  escrowId: string,
  payload: { outcome: "BUYER_WINS" | "SELLER_WINS"; ref?: string }
): Promise<DisputeSummary> => {
  const response = await http.post(`/v1/disputes/${escrowId}/resolve`, payload)
  return response.data
}

export interface FiatStatusEntry {
  id: string
  status: string
  actor: string
  note?: string
  createdAt: string
}

export const postFiatStatus = async (
  escrowId: string,
  payload: { status: string; note?: string }
): Promise<FiatStatusEntry> => {
  const response = await http.post(`/v1/escrows/${escrowId}/fiat-status`, payload)
  return response.data
}

export const fetchAdminPools = async (tokenKey?: string): Promise<AdminPool[]> => {
  const response = await http.get<AdminPool[]>("/v1/admin/pools", {
    params: tokenKey ? { tokenKey } : undefined,
  })
  return response.data
}

export interface AdminWithdrawPayload {
  tokenKey: string
  feeAmount: string
  bondAmount: string
}

export const postAdminWithdraw = async (payload: AdminWithdrawPayload) => {
  const response = await http.post("/v1/admin/withdraw", payload)
  return response.data
}

export const fetchAdminTokens = async (params?: {
  chainId?: number
  tokenKey?: string
}): Promise<TokenRegistryEntry[]> => {
  const response = await http.get<TokenRegistryEntry[]>("/v1/admin/tokens", {
    params,
  })
  return response.data
}

export const postAdminToken = async (payload: {
  chainId: number
  tokenKey: string
  symbol: string
  name: string
  decimals: number
  enabled?: boolean
}) => {
  const response = await http.post("/v1/admin/tokens", payload)
  return response.data
}

export interface AdminRolePayload {
  address: string
}

export const postAdminRole = async (payload: AdminRolePayload) => {
  const response = await http.post("/v1/admin/roles/admins", payload)
  return response.data
}

export const postArbitratorRole = async (payload: AdminRolePayload) => {
  const response = await http.post("/v1/admin/roles/arbitrators", payload)
  return response.data
}
