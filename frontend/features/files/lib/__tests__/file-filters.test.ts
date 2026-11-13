import { describe, expect, it } from "vitest"
import { RECENT_WINDOW_MS, filterFilesForView, getFilesInFolder } from "@/features/files/lib/file-filters"
import { getFileType } from "@/features/files/lib/file-type"
import type { FileItem } from "@/features/files/types"

const now = Date.parse("2024-06-10T00:00:00Z")

function item(overrides: Partial<FileItem>): FileItem {
  return { id: 1, name: "a.txt", displayName: "a.txt", type: "document", path: "", isFolder: false, ...overrides }
}

const files = [
  item({ id: 1, name: "root.txt", modified: now - 1000 }),
  item({ id: 2, name: "nested.txt", path: "docs", modified: now - 2000 }),
  item({ id: 3, name: "old.txt", modified: now - RECENT_WINDOW_MS - 1 }),
  item({ id: -1, name: "docs", type: "folder", isFolder: true }),
  item({ id: 4, name: "deep.txt", path: "docs/2024" }),
  item({ id: 5, name: "other.txt", path: "docsx" }),
]

describe("filterFilesForView", () => {
  it("shows only items in the current folder for the all view", () => {
    const ids = (path: string) => filterFilesForView(files, { view: "all", currentPath: path, now }).map((f) => f.id)
    expect(ids("")).toEqual([1, 3, -1])
    expect(ids("docs")).toEqual([2])
  })

  it("filters by case-insensitive search", () => {
    const result = filterFilesForView(files, { view: "all", currentPath: "", searchQuery: "ROOT", now })
    expect(result.map((f) => f.id)).toEqual([1])
  })

  it("shows recent files from every folder, newest first, without folders", () => {
    const result = filterFilesForView(files, { view: "recent", currentPath: "", now })
    expect(result.map((f) => f.id)).toEqual([1, 2])
  })

  it("shows every trashed file regardless of path", () => {
    expect(filterFilesForView(files, { view: "trash", currentPath: "", now })).toHaveLength(files.length)
  })
})

describe("getFilesInFolder", () => {
  it("returns files in the folder and its subfolders only", () => {
    expect(getFilesInFolder(files, "docs").map((f) => f.id)).toEqual([2, 4])
  })
})

describe("getFileType", () => {
  it("detects types from extensions", () => {
    expect(getFileType("photo.JPG")).toBe("image")
    expect(getFileType("doc.pdf")).toBe("pdf")
    expect(getFileType("song.mp3")).toBe("audio")
    expect(getFileType("movie.mkv")).toBe("video")
    expect(getFileType("backup.tar")).toBe("archive")
    expect(getFileType("notes.docx")).toBe("document")
    expect(getFileType("README")).toBe("file")
    expect(getFileType("data.xyz")).toBe("file")
  })
})
