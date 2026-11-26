import { describe, expect, it } from "vitest"
import { countFolderChildren, sortFiles, toggleSort } from "@/features/files/lib/sort-files"
import type { FileItem } from "@/features/files/types"

function file(name: string, extra: Partial<FileItem> = {}): FileItem {
  return { id: name.length, name, displayName: name, type: "file", path: "", isFolder: false, ...extra }
}

const folderB = file("b-folder", { isFolder: true, type: "folder" })
const folderA = file("a-folder", { isFolder: true, type: "folder" })
const big = file("big.bin", { size: 500, modified: 3 })
const small = file("small.bin", { size: 5, modified: 1 })
const unknown = file("unknown.bin")
const files = [small, folderB, unknown, big, folderA]

const names = (items: FileItem[]) => items.map((item) => item.name)

describe("sortFiles", () => {
  it("keeps folders first and sorts names naturally", () => {
    expect(names(sortFiles(files, { key: "name", direction: "asc" }))).toEqual([
      "a-folder",
      "b-folder",
      "big.bin",
      "small.bin",
      "unknown.bin",
    ])
    expect(names(sortFiles([file("file10"), file("file2")], { key: "name", direction: "asc" }))).toEqual([
      "file2",
      "file10",
    ])
  })

  it("sorts by size or date in either direction, with missing values last", () => {
    expect(names(sortFiles(files, { key: "size", direction: "desc" })).slice(2)).toEqual([
      "big.bin",
      "small.bin",
      "unknown.bin",
    ])
    expect(names(sortFiles(files, { key: "modified", direction: "asc" })).slice(2)).toEqual([
      "small.bin",
      "big.bin",
      "unknown.bin",
    ])
  })

  it("sorts trashed files by purge date", () => {
    const soon = file("soon", { purgeAt: 1 })
    const later = file("later", { purgeAt: 9 })
    expect(names(sortFiles([later, soon], { key: "purgeAt", direction: "asc" }))).toEqual(["soon", "later"])
  })
})

describe("toggleSort", () => {
  it("flips the direction on the same column and picks a sensible default on a new one", () => {
    expect(toggleSort({ key: "name", direction: "asc" }, "name")).toEqual({ key: "name", direction: "desc" })
    expect(toggleSort({ key: "name", direction: "asc" }, "size")).toEqual({ key: "size", direction: "desc" })
    expect(toggleSort({ key: "size", direction: "desc" }, "purgeAt")).toEqual({ key: "purgeAt", direction: "asc" })
  })
})

describe("countFolderChildren", () => {
  it("counts direct children per folder path", () => {
    const counts = countFolderChildren([
      file("a", { path: "docs" }),
      file("b", { path: "docs" }),
      file("c", { path: "docs/old" }),
      file("d"),
    ])
    expect(counts.get("docs")).toBe(2)
    expect(counts.get("docs/old")).toBe(1)
    expect(counts.get("")).toBe(1)
  })
})
