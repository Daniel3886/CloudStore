import { describe, expect, it } from "vitest"
import { MAX_PREVIEW_SIZE, canPreview, getExpiryInfo, toSizeUnit } from "@/features/public-links/lib/links"

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

describe("toSizeUnit", () => {
  it("picks the largest fitting unit and rounds to two decimals", () => {
    expect(toSizeUnit(0)).toEqual({ value: 0, unit: "byte" })
    expect(toSizeUnit(512)).toEqual({ value: 512, unit: "byte" })
    expect(toSizeUnit(1536)).toEqual({ value: 1.5, unit: "kilobyte" })
    expect(toSizeUnit(5 * 1024 * 1024)).toEqual({ value: 5, unit: "megabyte" })
    expect(toSizeUnit(1234567890)).toEqual({ value: 1.15, unit: "gigabyte" })
    expect(toSizeUnit(1024 ** 6)).toEqual({ value: 1024 * 1024, unit: "terabyte" })
  })
})
