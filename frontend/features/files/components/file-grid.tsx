"use client"

import { FileCard } from "@/features/files/components/file-card"
import type { FileAction, FileItem } from "@/features/files/types"

interface FileGridProps {
  files: FileItem[]
  loadingStates: Record<number, boolean>
  isTrashView: boolean
  onFileClick: (file: FileItem) => void
  onFileAction: (action: FileAction, file: FileItem) => void
}

export function FileGrid({ files, loadingStates, isTrashView, onFileClick, onFileAction }: FileGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          isLoading={loadingStates[file.id] ?? false}
          isTrashView={isTrashView}
          onFileClick={onFileClick}
          onFileAction={onFileAction}
        />
      ))}
    </div>
  )
}
