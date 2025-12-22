import { createRoot } from "react-dom/client"
import type React from "react"
import { describe, expect, it } from "vitest"
import { TxFlowModal } from "./TxFlowModal"

const render = (component: React.ReactElement) => {
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(component)
  return () => {
    root.unmount()
    container.remove()
  }
}

describe("TxFlowModal", () => {
  it("renders the wallet prompt label", async () => {
    const cleanup = render(<TxFlowModal open status="wallet" />)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(document.body.textContent).toContain("Confirm wallet prompt")
    cleanup()
  })

  it("renders an error message", async () => {
    const cleanup = render(<TxFlowModal open status="error" error={new Error("fail")} />)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(document.body.textContent).toContain("Action failed")
    expect(document.body.textContent).toContain("fail")
    cleanup()
  })
})
