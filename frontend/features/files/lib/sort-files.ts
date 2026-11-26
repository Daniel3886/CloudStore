import type { FileItem } from "@/features/files/types"

export type SortKey = "name" | "size" | "modified" | "purgeAt"
export type SortDirection = "asc" | "desc"

export interface FileSort {
  key: SortKey
  direction: SortDirection
}

export const DEFAULT_SORT: FileSort = { key: "name", direction: "asc" }

function compareOptional(a: number | undefined, b: number | undefined): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return a - b
}

/** Sorts files by the chosen column. Folders always come first, sorted by name. */
export function sortFiles(files: FileItem[], { key, direction }: FileSort): FileItem[] {
  const sign = direction === "asc" ? 1 : -1
  return [...files].sort((a, b) => {
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
    if (a.isFolder) return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })

    const byName = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    let result: number
    switch (key) {
      case "size":
        result = compareOptional(a.size, b.size)
        break
      case "modified":
        result = compareOptional(a.modified, b.modified)
        break
      case "purgeAt":
        result = compareOptional(a.purgeAt, b.purgeAt)
        break
      default:
        result = byName
    }
    // Files missing the sorted value stay at the end in both directions.
    const missing = key !== "name" && (a[key] == null) !== (b[key] == null)
    return missing ? result : result * sign || byName
  })
}

export function toggleSort(current: FileSort, key: SortKey): FileSort {
  if (current.key === key) return { key, direction: current.direction === "asc" ? "desc" : "asc" }
  return { key, direction: key === "name" || key === "purgeAt" ? "asc" : "desc" }
}

/** Number of files and folders directly inside each folder path. */
export function countFolderChildren(files: FileItem[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const file of files) {
    counts.set(file.path, (counts.get(file.path) ?? 0) + 1)
  }
  return counts
}
