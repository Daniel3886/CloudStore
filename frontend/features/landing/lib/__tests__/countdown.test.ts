import { describe, expect, it } from "vitest"
import { getCountdown } from "@/features/landing/lib/countdown"

describe("getCountdown", () => {
  it("splits the time left and counts whole hours used", () => {
    const now = 0
    expect(getCountdown(now + (17 * 60 + 42) * 60_000 + 5_000, now)).toEqual({
      hours: 17,
      minutes: 42,
      seconds: 5,
      hoursUsed: 6,
    })
  })

  it("stops at zero once the link has expired", () => {
    expect(getCountdown(0, 10_000)).toEqual({ hours: 0, minutes: 0, seconds: 0, hoursUsed: 24 })
  })
})
