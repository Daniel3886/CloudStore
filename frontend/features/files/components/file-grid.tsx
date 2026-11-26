"use client"

import type { PublicFileAccessToken } from "@/features/public-links/api"
import { FileCard } from "@/features/files/components/file-card"
import { getItemPath } from "@/features/files/lib/file-filters"
import type { FileAction, FileItem } from "@/features/files/types"

interface FileGridProps {
  files: FileItem[]
  loadingStates: Record<number, boolean>
  isTrashView: boolean
  folderCounts: Map<string, number>
  publicLinks: Map<number, PublicFileAccessToken>
  onFileClick: (file: FileItem) => void
  onFileAction: (action: FileAction, file: FileItem) => void
}

export function FileGrid({
  files,
  loadingStates,
  isTrashView,
  folderCounts,
  publicLinks,
  onFileClick,
  onFileAction,
}: FileGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          isLoading={loadingStates[file.id] ?? false}
          isTrashView={isTrashView}
          folderCount={file.isFolder ? (folderCounts.get(getItemPath(file)) ?? 0) : 0}
          publicLink={publicLinks.get(file.id)}
          onFileClick={onFileClick}
          onFileAction={onFileAction}
        />
      ))}
    </div>
  )
}
