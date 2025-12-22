export interface EvidenceEntry {
  id: string
  escrowId: string
  uploader: string
  uri: string
  sha256: string
  mime: string
  size: string
  description?: string
  createdAt: string
}
