export interface NotificationEvent {
  type: string
  escrowId: string
  sender: string
  payload: Record<string, unknown>
}
