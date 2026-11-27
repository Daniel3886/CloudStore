"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Clock, Plus, Search, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NewFolderModal } from "@/features/files/components/new-folder-modal"
import { UploadModal } from "@/features/files/components/upload-modal"
import { TRASH_RETENTION_DAYS } from "@/features/files/lib/trash"
import type { FileView } from "@/features/files/types"

interface FileHeaderProps {
  title: string
  type?: FileView
  onRefresh?: () => void
  currentPath?: string
  onSearch?: (query: string) => void
}

export function FileHeader({ title, type = "all", onRefresh, currentPath = "", onSearch }: FileHeaderProps) {
  const t = useTranslations("files.header")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [newFolderOpen, setNewFolderOpen] = useState(false)

  const showActionButtons = type === "all"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        {showActionButtons && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setNewFolderOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("newFolder")}
            </Button>
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              {t("upload")}
            </Button>
          </div>
        )}
      </div>
      {type === "trash" && (
        <p className="-mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" aria-hidden />
          {t("trashNote", { days: TRASH_RETENTION_DAYS })}
        </p>
      )}
      {onSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            className="pl-9"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      )}

      {showActionButtons && (
        <>
          <UploadModal
            open={uploadOpen}
            onOpenChange={setUploadOpen}
            onUploadComplete={onRefresh}
            currentPath={currentPath}
          />
          <NewFolderModal
            open={newFolderOpen}
            onOpenChange={setNewFolderOpen}
            currentPath={currentPath}
            onFolderCreated={onRefresh}
          />
        </>
      )}
    </div>
  )
}
