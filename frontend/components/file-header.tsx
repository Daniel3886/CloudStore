"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Grid, List, Plus, Search, SlidersHorizontal, Upload } from "lucide-react"
import { UploadModal } from "./upload-modal"
import { NewFolderModal } from "./new-folder-modal"

interface FileHeaderProps {
  title?: string
  onRefresh?: () => void
}

export function FileHeader({ title = "My Files", onRefresh }: FileHeaderProps) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
            {viewMode === "grid" ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setNewFolderOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search files and folders..." className="pl-9" />
      </div>
      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} onUploadComplete={onRefresh} />
      <NewFolderModal open={newFolderOpen} onOpenChange={setNewFolderOpen} />
    </div>
  )
}
