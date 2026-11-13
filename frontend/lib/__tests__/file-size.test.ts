import { describe, expect, it } from "vitest"
import { toSizeUnit } from "@/lib/file-size"

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
