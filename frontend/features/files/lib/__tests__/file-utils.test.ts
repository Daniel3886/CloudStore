import { describe, expect, it } from "vitest"
import { formatFileSize, getFileExtension, getFileNameWithoutExtension } from "@/features/files/lib/file-utils"

describe("file utils", () => {
  it("formats sizes with binary units", () => {
    expect(formatFileSize(0)).toBe("0 Bytes")
    expect(formatFileSize(1024)).toBe("1 KB")
    expect(formatFileSize(1536)).toBe("1.5 KB")
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5 MB")
  })

  it("splits names and extensions, treating dotfiles as names", () => {
    expect(getFileExtension("report.final.pdf")).toBe(".pdf")
    expect(getFileExtension(".env")).toBe("")
    expect(getFileNameWithoutExtension("report.final.pdf")).toBe("report.final")
    expect(getFileNameWithoutExtension("README")).toBe("README")
  })
})
