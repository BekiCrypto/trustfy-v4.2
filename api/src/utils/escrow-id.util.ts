import { BadRequestException } from "@nestjs/common"

const ESCROW_ID_REGEX = /^0x[0-9a-fA-F]{64}$/

export const parseEscrowId = (value: string) => {
  if (!value) {
    throw new BadRequestException("escrowId is required")
  }

  const normalized = value.startsWith("0x") ? value : `0x${value}`
  if (!ESCROW_ID_REGEX.test(normalized)) {
    throw new BadRequestException("invalid escrowId format")
  }
  return Buffer.from(normalized.slice(2), "hex")
}

export const formatEscrowId = (value: Buffer | null | undefined) => {
  if (!value) return ""
  return `0x${value.toString("hex")}`
}
