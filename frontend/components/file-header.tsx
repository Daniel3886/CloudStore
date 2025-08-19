"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Upload } from "lucide-react"
import { UploadModal } from "./upload-modal"
import { NewFolderModal } from "./new-folder-modal"

interface FileHeaderProps {
  title?: string
  type?: "all" | "shared" | "recent" | "starred" | "trash"
  onRefresh?: () => void
  currentPath?: string
  virtualFolders?: string[]
  saveVirtualFolders?: (folders: string[]) => void
}

export function FileHeader({
  title = "My Files",
  type = "all",
  onRefresh,
  currentPath,
  virtualFolders,
  saveVirtualFolders,
}: FileHeaderProps) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [newFolderOpen, setNewFolderOpen] = useState(false)

  const showActionButtons = type === "all"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        {showActionButtons && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setNewFolderOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        )}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search files and folders..." className="pl-9" />
      </div>

      {showActionButtons && (
        <>
          <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} onUploadComplete={onRefresh} />
          <NewFolderModal
            open={newFolderOpen}
            onOpenChange={setNewFolderOpen}
            currentPath={currentPath}
            virtualFolders={virtualFolders}
            saveVirtualFolders={saveVirtualFolders}
          />
        </>
      )}
    </div>
  )
}
