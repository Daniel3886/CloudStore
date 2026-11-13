import { describe, expect, it } from "vitest"
import { MAX_PREVIEW_SIZE, canPreview, getExpiryInfo } from "@/features/public-links/lib/links"

describe("getExpiryInfo", () => {
  const now = new Date("2026-01-01T12:00:00Z")

  it("returns remaining hours and minutes", () => {
    expect(getExpiryInfo("2026-01-01T14:30:59Z", now)).toEqual({ expired: false, hours: 2, minutes: 30 })
    expect(getExpiryInfo("2026-01-01T12:05:00Z", now)).toEqual({ expired: false, hours: 0, minutes: 5 })
  })

  it("marks past, current and invalid dates as expired", () => {
    expect(getExpiryInfo("2026-01-01T11:00:00Z", now).expired).toBe(true)
    expect(getExpiryInfo("2026-01-01T12:00:00Z", now).expired).toBe(true)
    expect(getExpiryInfo("not a date", now).expired).toBe(true)
  })
})

describe("canPreview", () => {
  it("allows files up to the preview size limit", () => {
    expect(canPreview(MAX_PREVIEW_SIZE)).toBe(true)
    expect(canPreview(MAX_PREVIEW_SIZE + 1)).toBe(false)
  })
})
