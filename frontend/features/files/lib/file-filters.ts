import { joinPath } from "@/features/files/lib/file-utils"
import type { FileItem, FileView } from "@/features/files/types"

export const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

interface FilterOptions {
  view: FileView
  currentPath: string
  searchQuery?: string
  now?: number
}

export function filterFilesForView(
  files: FileItem[],
  { view, currentPath, searchQuery = "", now = Date.now() }: FilterOptions,
): FileItem[] {
  const query = searchQuery.toLowerCase()
  const matchesQuery = (file: FileItem) => file.name.toLowerCase().includes(query)

  if (view === "trash") return files.filter(matchesQuery)

  if (view === "recent") {
    return files
      .filter((file) => !file.isFolder && (file.modified ?? 0) > now - RECENT_WINDOW_MS && matchesQuery(file))
      .sort((a, b) => (b.modified ?? 0) - (a.modified ?? 0))
  }

  return files.filter((file) => file.path === currentPath && matchesQuery(file))
}

export function getFilesInFolder(files: FileItem[], folderPath: string): FileItem[] {
  return files.filter((file) => !file.isFolder && (file.path === folderPath || file.path.startsWith(`${folderPath}/`)))
}

export function getItemPath(file: FileItem): string {
  return joinPath(file.path, file.name)
}
