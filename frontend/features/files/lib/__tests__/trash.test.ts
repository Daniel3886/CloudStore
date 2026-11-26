import { describe, expect, it } from "vitest"
import { daysUntilPurge } from "@/features/files/lib/trash"

const DAY = 24 * 60 * 60 * 1000
const now = Date.parse("2026-11-25T12:00:00Z")

describe("daysUntilPurge", () => {
  it("rounds partial days up so a file never shows 0 days while it still exists", () => {
    expect(daysUntilPurge(now + 29 * DAY + 1, now)).toBe(30)
    expect(daysUntilPurge(now + DAY, now)).toBe(1)
    expect(daysUntilPurge(now + 60_000, now)).toBe(1)
  })

  it("returns 0 once the purge time has passed", () => {
    expect(daysUntilPurge(now - DAY, now)).toBe(0)
  })

  it("returns undefined when the server sent no purge date", () => {
    expect(daysUntilPurge(undefined, now)).toBeUndefined()
    expect(daysUntilPurge(Number.NaN, now)).toBeUndefined()
  })
})
