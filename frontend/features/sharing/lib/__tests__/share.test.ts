import { describe, expect, it } from "vitest"
import type { SharedFileDto } from "@/features/sharing/api"
import { getDownloadName, isValidEmail, parseDate, toFileId, withShareStatus } from "@/features/sharing/lib/share"

describe("isValidEmail", () => {
  it("accepts plausible addresses and rejects malformed ones", () => {
    expect(isValidEmail("ana@example.com")).toBe(true)
    expect(isValidEmail("  ana@example.com ")).toBe(true)
    expect(isValidEmail("ana@example")).toBe(false)
    expect(isValidEmail("ana example.com")).toBe(false)
    expect(isValidEmail("")).toBe(false)
  })
})

describe("toFileId", () => {
  it("returns positive integer ids from numbers and numeric strings", () => {
    expect(toFileId(42)).toBe(42)
    expect(toFileId("42")).toBe(42)
  })

  it("rejects missing, non-numeric and non-positive ids", () => {
    expect(toFileId(undefined)).toBeNull()
    expect(toFileId("")).toBeNull()
    expect(toFileId("abc")).toBeNull()
    expect(toFileId(-5)).toBeNull()
    expect(toFileId(0)).toBeNull()
    expect(toFileId(1.5)).toBeNull()
  })
})

describe("getDownloadName", () => {
  it("uses the last path segment of the display name", () => {
    expect(getDownloadName("docs/2024/report.pdf")).toBe("report.pdf")
    expect(getDownloadName("report.pdf")).toBe("report.pdf")
    expect(getDownloadName("docs/")).toBe("docs/")
  })
})

describe("parseDate", () => {
  it("returns null for missing or invalid dates", () => {
    expect(parseDate(undefined)).toBeNull()
    expect(parseDate("nope")).toBeNull()
    expect(parseDate("2026-01-01T00:00:00Z")?.toISOString()).toBe("2026-01-01T00:00:00.000Z")
  })
})

describe("withShareStatus", () => {
  it("updates only the matching share", () => {
    const base = { fileId: 1, displayName: "a", sharedBy: "x", s3Key: "k", sharedAt: "", sharedWithEmail: "me" }
    const files: SharedFileDto[] = [
      { ...base, permissionId: 1, shareStatus: "PENDING" },
      { ...base, permissionId: 2, shareStatus: "PENDING" },
    ]

    const result = withShareStatus(files, 2, "ACCEPTED", "2026-01-01")

    expect(result[0]).toBe(files[0])
    expect(result[1]).toMatchObject({ shareStatus: "ACCEPTED", shareStatusChangedAt: "2026-01-01" })
  })
})
