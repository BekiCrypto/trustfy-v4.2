import { z } from "zod"

const MAX_BPS = 10_000

export const tokenConfigSchema = z
  .object({
    enabled: z.boolean(),
    makerFeeBps: z.number().int().min(0).max(MAX_BPS),
    takerFeeBps: z.number().int().min(0).max(MAX_BPS),
    disputeBondBps: z.number().int().min(0).max(MAX_BPS),
    adBondBps: z.number().int().min(0).max(MAX_BPS),
    adBondFixed: z.string().regex(/^\d+$/, "Invalid uint256"),
    sellerFundWindow: z.number().int().positive(),
    buyerConfirmWindow: z.number().int().positive(),
    sellerReleaseWindow: z.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    const totalFeeBps = data.makerFeeBps + data.takerFeeBps
    if (totalFeeBps > MAX_BPS) {
      ctx.addIssue({
        path: ["makerFeeBps"],
        message: "Maker + Taker fee cannot exceed 100%",
        code: z.ZodIssueCode.custom,
      })
    }
    if (data.adBondBps === 0 && BigInt(data.adBondFixed) === 0n) {
      ctx.addIssue({
        path: ["adBondBps"],
        message: "Either AdBond % or legacy AdBond must be set",
        code: z.ZodIssueCode.custom,
      })
    }
  })

export type TokenConfigInput = z.infer<typeof tokenConfigSchema>
