"use client"

import { useTranslations } from "next-intl"
import { FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UploadFileRow } from "@/features/files/components/upload-file-row"
import type { UploadItem } from "@/features/files/hooks/use-upload-queue"

interface UploadFileListProps {
  items: UploadItem[]
  pendingCount: number
  disabled: boolean
  onBrowse: () => void
  onClear: () => void
  onRemove: (id: number) => void
}

export function UploadFileList({ items, pendingCount, disabled, onBrowse, onClear, onRemove }: UploadFileListProps) {
  const t = useTranslations("files.upload")

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {t("selected", { count: items.length })}
          {pendingCount > 0 && ` ${t("pending", { count: pendingCount })}`}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onBrowse} disabled={disabled}>
            <FolderOpen className="h-4 w-4 mr-1" />
            {t("browse")}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear} disabled={disabled}>
            {t("clearAll")}
          </Button>
        </div>
      </div>

      <ul className="space-y-2 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <UploadFileRow key={item.id} item={item} canRemove={!disabled} onRemove={onRemove} />
        ))}
      </ul>
    </div>
  )
}
