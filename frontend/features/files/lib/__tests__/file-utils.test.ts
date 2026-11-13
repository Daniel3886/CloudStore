import { describe, expect, it } from "vitest"
import {
  getFileExtension,
  getFileNameWithoutExtension,
  getUniqueFileName,
  joinPath,
  splitPath,
  validateFileName,
} from "@/features/files/lib/file-utils"

describe("file utils", () => {
  it("splits names and extensions, treating dotfiles as names", () => {
    expect(getFileExtension("report.final.pdf")).toBe(".pdf")
    expect(getFileExtension(".env")).toBe("")
    expect(getFileNameWithoutExtension("report.final.pdf")).toBe("report.final")
    expect(getFileNameWithoutExtension("README")).toBe("README")
  })

  it("joins and splits paths", () => {
    expect(joinPath("", "a.txt")).toBe("a.txt")
    expect(joinPath("docs/2024", "a.txt")).toBe("docs/2024/a.txt")
    expect(splitPath("docs/2024/a.txt")).toEqual({ parent: "docs/2024", name: "a.txt" })
    expect(splitPath("docs")).toEqual({ parent: "", name: "docs" })
  })

  it("generates unique names for duplicates", () => {
    expect(getUniqueFileName("a.txt", new Set())).toBe("a.txt")
    expect(getUniqueFileName("a.txt", new Set(["a.txt"]))).toBe("a (1).txt")
    expect(getUniqueFileName("a.txt", new Set(["a.txt", "a (1).txt"]))).toBe("a (2).txt")
    expect(getUniqueFileName("README", new Set(["README"]))).toBe("README (1)")
  })
})

describe("validateFileName", () => {
  it("accepts valid names", () => {
    expect(validateFileName("report.pdf", false)).toBeNull()
    expect(validateFileName("a".repeat(255), true)).toBeNull()
  })

  it("rejects empty names with the item kind", () => {
    expect(validateFileName("   ", true)).toMatchObject({ key: "empty", values: { kind: "folder" } })
    expect(validateFileName("", false)).toMatchObject({ key: "empty", values: { kind: "file" } })
  })

  it("rejects names that are too long", () => {
    expect(validateFileName("a".repeat(256), false)).toMatchObject({ key: "tooLong", values: { max: 255 } })
  })

  it.each(["a/b", "a\\b", "a:b", "a*b", "a?b", 'a"b', "a<b", "a>b", "a|b"])(
    "rejects invalid characters in %s",
    (name) => {
      expect(validateFileName(name, false)?.key).toBe("invalidChars")
    },
  )

  it("rejects reserved names case-insensitively", () => {
    expect(validateFileName("con", false)).toEqual({ key: "reserved", values: { name: "con" } })
    expect(validateFileName("LPT9", true)?.key).toBe("reserved")
    expect(validateFileName("COM10", true)).toBeNull()
  })
})
