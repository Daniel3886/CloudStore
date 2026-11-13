"use client"

import { useTranslations } from "next-intl"
import { AlertCircle, CheckCircle, FileIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFileFormatters } from "@/features/files/hooks/use-file-formatters"
import type { UploadItem, UploadStatus } from "@/features/files/hooks/use-upload-queue"

const MAX_ERROR_LENGTH = 50

function StatusIcon({ status }: { status: UploadStatus }) {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" aria-hidden />
    case "error":
      return <AlertCircle className="h-5 w-5 text-red-500" aria-hidden />
    case "uploading":
      return (
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-hidden />
      )
    default:
      return <FileIcon className="h-5 w-5 text-muted-foreground" aria-hidden />
  }
}

interface UploadFileRowProps {
  item: UploadItem
  canRemove: boolean
  onRemove: (id: number) => void
}

export function UploadFileRow({ item, canRemove, onRemove }: UploadFileRowProps) {
  const t = useTranslations("files.upload")
  const { formatSize } = useFileFormatters()
  const { file, status, error } = item

  return (
    <li className="flex items-center justify-between p-3 bg-muted/30 rounded-md border">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <StatusIcon status={status} />
        <span className="sr-only">{t(`status.${status}`)}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
            {status === "completed" && <span className="text-xs text-green-600 font-medium">{t("uploaded")}</span>}
            {status === "error" && <span className="text-xs text-red-600 font-medium">{t("failed")}</span>}
          </div>
          {error && (
            <p className="text-xs text-red-500 mt-1 truncate" title={error}>
              {error.length > MAX_ERROR_LENGTH ? `${error.substring(0, MAX_ERROR_LENGTH)}...` : error}
            </p>
          )}
        </div>
      </div>

      {canRemove && status === "pending" && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item.id)}
          className="h-8 w-8"
          aria-label={t("remove", { name: file.name })}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </li>
  )
}
