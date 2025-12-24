export interface NotificationEvent {
  userAddress: string
  type: string
  title: string
  message: string
  link?: string
  metadata?: Record<string, unknown>
  // Legacy fields (optional)
  escrowId?: string
  sender?: string
  payload?: Record<string, unknown>
}
