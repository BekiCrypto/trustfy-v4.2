import { describe, expect, it } from "vitest"
import { computeNextActions } from "./nextAction"

describe("Next action engine", () => {
  it("shows Take Escrow for buyer on CREATED", () => {
    const actions = computeNextActions({
      state: "CREATED",
      walletAddress: "0xbuyer",
      roles: ["USER"],
      escrow: {
        escrowId: "0x1",
        chainId: 97,
        tokenKey: "0x0",
        amount: "1",
        feeAmount: "0",
        sellerBond: "0",
        buyerBond: "0",
        state: "CREATED",
        seller: "0xseller",
        buyer: "0xbuyer",
        updatedAtBlock: 1,
        updatedAt: "",
        timeline: [],
        participants: { seller: "0xseller" },
      },
    })

    expect(actions.map((action) => action.id)).toContain("take")
  })

  it("includes resolve action for arbitrator on DISPUTED", () => {
    const actions = computeNextActions({
      state: "DISPUTED",
      walletAddress: "0xarb",
      roles: ["ARBITRATOR"],
      escrow: {
        escrowId: "0x1",
        chainId: 97,
        tokenKey: "0x0",
        amount: "1",
        feeAmount: "0",
        sellerBond: "0",
        buyerBond: "0",
        state: "DISPUTED",
        seller: "0xseller",
        buyer: "0xbuyer",
        updatedAtBlock: 1,
        updatedAt: "",
        timeline: [],
        participants: { seller: "0xseller" },
      },
    })

    expect(actions.some((action) => action.id === "resolve")).toBe(true)
  })
})
