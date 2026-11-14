import { describe, expect, it } from "vitest"
import {
  buildFolderItems,
  collectFolderPaths,
  getActualFileName,
  mapFileResponse,
  mapFileResponses,
} from "@/features/files/lib/map-file"
import type { FileResponse } from "@/features/files/api"

const options = { unknownName: "Unknown File", fallbackId: 999 }

describe("mapFileResponse", () => {
  it("maps a backend file into a FileItem", () => {
    const file: FileResponse = {
      id: 7,
      key: "user/abc.pdf",
      size: 2048,
      lastModified: "2024-03-01T10:00:00Z",
      displayName: "reports/2024/summary.pdf",
    }

    expect(mapFileResponse(file, options)).toEqual({
      id: 7,
      name: "summary.pdf",
      displayName: "reports/2024/summary.pdf",
      type: "pdf",
      size: 2048,
      modified: Date.parse("2024-03-01T10:00:00Z"),
      s3Key: "user/abc.pdf",
      path: "reports/2024",
      isFolder: false,
    })
  })

  it("strips the legacy 13-digit timestamp prefix from the file name", () => {
    const item = mapFileResponse({ id: 1, key: "k", displayName: "photos/1700000000000-cat.png" }, options)
    expect(item.name).toBe("cat.png")
    expect(item.type).toBe("image")
    expect(item.path).toBe("photos")
  })

  it("keeps names that only look similar to the legacy prefix", () => {
    expect(getActualFileName("123-notes.txt")).toBe("123-notes.txt")
  })

  it("accepts numeric timestamps and numeric strings", () => {
    const item = mapFileResponse(
      {
        id: "12" as unknown as number,
        key: "k",
        size: "512" as unknown as number,
        lastModified: 1700000000000,
        displayName: "a.txt",
      },
      options,
    )
    expect(item.id).toBe(12)
    expect(item.size).toBe(512)
    expect(item.modified).toBe(1700000000000)
    expect(item.path).toBe("")
  })

  it("falls back for missing or invalid values", () => {
    const item = mapFileResponse({ id: Number.NaN, key: "", lastModified: "not a date", displayName: "" }, options)
    expect(item).toMatchObject({
      id: 999,
      name: "Unknown File",
      size: undefined,
      modified: undefined,
      s3Key: undefined,
    })
  })

  it("assigns distinct fallback ids to files without ids", () => {
    const items = mapFileResponses(
      [
        { id: Number.NaN, key: "a", displayName: "a" },
        { id: Number.NaN, key: "b", displayName: "b" },
      ],
      "Unknown",
    )
    expect(new Set(items.map((item) => item.id)).size).toBe(2)
  })
})

describe("buildFolderItems", () => {
  it("creates folder items with stable ids and parent paths", () => {
    const folders = buildFolderItems(["docs", "docs/invoices"])
    expect(folders).toEqual([
      { id: -1, name: "docs", displayName: "docs", type: "folder", path: "", isFolder: true },
      { id: -2, name: "invoices", displayName: "docs/invoices", type: "folder", path: "docs", isFolder: true },
    ])
    expect(buildFolderItems(["docs", "docs/invoices"])).toEqual(folders)
  })
})

describe("collectFolderPaths", () => {
  it("derives every folder and parent folder from file paths and merges saved folders", () => {
    const files = mapFileResponses(
      [
        { id: 1, key: "k1", displayName: "reports/2024/summary.pdf" },
        { id: 2, key: "k2", displayName: "photos/cat.png" },
        { id: 3, key: "k3", displayName: "notes.txt" },
      ],
      "Unknown File",
    )

    expect(collectFolderPaths(files, ["empty", "photos"])).toEqual(["empty", "photos", "reports", "reports/2024"])
  })
})
