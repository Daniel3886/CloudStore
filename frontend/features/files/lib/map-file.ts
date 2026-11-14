import type { FileResponse } from "@/features/files/api"
import { getFileType } from "@/features/files/lib/file-type"
import { splitPath } from "@/features/files/lib/file-utils"
import type { FileItem } from "@/features/files/types"

const LEGACY_TIMESTAMP_PREFIX = /^\d{13}-(.+)$/

export function getActualFileName(displayName: string): string {
  const fileName = displayName.split("/").pop() || displayName
  return fileName.match(LEGACY_TIMESTAMP_PREFIX)?.[1] ?? fileName
}

function toNumber(value: unknown): number | undefined {
  if (value == null || value === "") return undefined
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function toTimestamp(value: unknown): number | undefined {
  if (value == null || value === "") return undefined
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined
  const parsed = Date.parse(String(value))
  return Number.isNaN(parsed) ? undefined : parsed
}

export interface MapFileOptions {
  unknownName: string
  fallbackId: number
}

export function mapFileResponse(file: FileResponse, { unknownName, fallbackId }: MapFileOptions): FileItem {
  const displayName = file.displayName ?? ""
  const name = displayName ? getActualFileName(displayName) : unknownName

  return {
    id: toNumber(file.id) ?? fallbackId,
    name,
    displayName,
    type: getFileType(name),
    size: toNumber(file.size),
    modified: toTimestamp(file.lastModified),
    s3Key: file.key || undefined,
    path: displayName.split("/").slice(0, -1).join("/"),
    isFolder: false,
  }
}

export function mapFileResponses(files: FileResponse[], unknownName: string): FileItem[] {
  return files.map((file, index) => mapFileResponse(file, { unknownName, fallbackId: Number.MAX_SAFE_INTEGER - index }))
}

export function buildFolderItems(folderPaths: string[]): FileItem[] {
  return folderPaths.map((folderPath, index) => {
    const { parent, name } = splitPath(folderPath)
    return {
      id: -(index + 1),
      name,
      displayName: folderPath,
      type: "folder",
      path: parent,
      isFolder: true,
    }
  })
}

export function collectFolderPaths(files: FileItem[], extraFolders: string[] = []): string[] {
  const folders = new Set<string>()
  const addWithParents = (folderPath: string) => {
    const segments = folderPath.split("/").filter(Boolean)
    for (let depth = 1; depth <= segments.length; depth++) {
      folders.add(segments.slice(0, depth).join("/"))
    }
  }
  files.forEach((file) => addWithParents(file.path))
  extraFolders.forEach(addWithParents)
  return [...folders].sort((a, b) => a.localeCompare(b))
}
