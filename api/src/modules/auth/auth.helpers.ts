import { hashMessage, recoverAddress } from "ethers"
import { createHash } from "node:crypto"

export interface AuthMessagePayload {
  domain: string
  address: string
  chainId: number
  nonce: string
  issuedAt: string
  expirationTime: string
}

export function buildAuthMessage(payload: AuthMessagePayload) {
  return [
    `${payload.domain} requests signature for Trustfy authentication.`,
    `Address: ${payload.address}`,
    `Chain ID: ${payload.chainId}`,
    `Nonce: ${payload.nonce}`,
    `Issued At: ${payload.issuedAt}`,
    `Expiration Time: ${payload.expirationTime}`,
  ].join("\n")
}

export function hashNonce(nonce: string) {
  return createHash("sha256").update(nonce).digest("hex")
}

export function signatureMatchesMessage(signature: string, message: string, address: string) {
  try {
    const digest = hashMessage(message)
    const recovered = recoverAddress(digest, signature)
    return recovered.toLowerCase() === address.toLowerCase()
  } catch (error) {
    return false
  }
}
