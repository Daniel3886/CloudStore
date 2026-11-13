import { describe, expect, it } from "vitest"
import { parsePeriod, periodToValue } from "@/features/activity/lib/period"
import { getTimestampDisplay } from "@/features/activity/lib/timestamp"

describe("period helpers", () => {
  it("round-trips period values", () => {
    expect(parsePeriod(periodToValue(7))).toBe(7)
    expect(parsePeriod(periodToValue("all"))).toBe("all")
  })

  it("falls back to the default period for invalid input", () => {
    expect(parsePeriod("abc")).toBe(30)
    expect(parsePeriod("-5")).toBe(30)
  })
})

describe("getTimestampDisplay", () => {
  const now = new Date("2026-11-13T12:00:00Z")

  it("classifies timestamps by age", () => {
    expect(getTimestampDisplay(new Date("2026-11-13T11:59:30Z"), now)).toBe("justNow")
    expect(getTimestampDisplay(new Date("2026-11-13T09:00:00Z"), now)).toBe("relative")
    expect(getTimestampDisplay(new Date("2026-11-08T12:00:00Z"), now)).toBe("relative")
    expect(getTimestampDisplay(new Date("2026-10-01T12:00:00Z"), now)).toBe("date")
  })

  it("detects invalid dates", () => {
    expect(getTimestampDisplay(new Date("not a date"), now)).toBe("invalid")
  })
})
