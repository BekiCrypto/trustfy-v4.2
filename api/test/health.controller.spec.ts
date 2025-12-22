import { describe, expect, it } from "vitest"
import { HealthController } from "../src/modules/health/health.controller"

describe("HealthController", () => {
  it("returns ok", () => {
    const controller = new HealthController()
    expect(controller.ping()).toEqual({ status: "ok" })
  })
})
