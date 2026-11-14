"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { UploadDropzone } from "@/features/files/components/upload-dropzone"
import { UploadFileList } from "@/features/files/components/upload-file-list"
import { useUploadQueue } from "@/features/files/hooks/use-upload-queue"

const AUTO_CLOSE_DELAY_MS = 1500

interface UploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete?: () => void
  currentPath?: string
}

export function UploadModal({ open, onOpenChange, onUploadComplete, currentPath = "" }: UploadModalProps) {
  const t = useTranslations("files")
  const queue = useUploadQueue(currentPath)
  const inputRef = useRef<HTMLInputElement>(null)
  const closeTimerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    },
    [],
  )

  const close = () => {
    onOpenChange(false)
    queue.clear()
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !queue.isUploading) queue.clear()
    onOpenChange(nextOpen)
  }

  const openFilePicker = () => inputRef.current?.click()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) queue.addFiles(e.target.files)
    e.target.value = ""
  }

  const handleUpload = async () => {
    const { succeeded, failed } = await queue.uploadAll()

    if (succeeded > 0) {
      toast({
        variant: "success",
        title: t("toasts.uploadComplete.title"),
        description: t("toasts.uploadComplete.description", { success: succeeded, failed }),
      })
      onUploadComplete?.()
    } else if (failed > 0) {
      toast({
        variant: "destructive",
        title: t("toasts.uploadFailed.title"),
        description: t("toasts.uploadFailed.description", { count: failed }),
      })
    }

    if (succeeded > 0 && failed === 0) {
      closeTimerRef.current = window.setTimeout(close, AUTO_CLOSE_DELAY_MS)
    }
  }

  const hasItems = queue.total > 0

  const secondaryLabel = queue.isFinished
    ? t("upload.close")
    : hasItems && !queue.isUploading
      ? t("upload.back")
      : t("upload.cancel")

  const handleSecondary = () => {
    if (queue.isFinished || !hasItems) close()
    else queue.clear()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("upload.title")}</DialogTitle>
          <DialogDescription>{t("upload.description")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <UploadDropzone compact={hasItems} onFilesDropped={queue.addFiles} onBrowse={openFilePicker} />
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            data-testid="upload-input"
            onChange={handleInputChange}
          />

          {hasItems && (
            <UploadFileList
              items={queue.items}
              pendingCount={queue.pendingCount}
              disabled={queue.isUploading}
              onBrowse={openFilePicker}
              onClear={queue.clear}
              onRemove={queue.removeItem}
            />
          )}

          {queue.isFinished && !queue.hasErrors && (
            <div
              role="status"
              className="flex items-center gap-2 justify-center p-3 rounded-md bg-success/10 text-success-foreground"
            >
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{t("upload.allDone")}</p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="secondary" onClick={handleSecondary} disabled={queue.isUploading}>
            {secondaryLabel}
          </Button>

          {!queue.isFinished && (
            <Button type="button" onClick={handleUpload} disabled={!hasItems || queue.isUploading}>
              {queue.isUploading
                ? t("upload.uploading", { current: queue.currentNumber, total: queue.total })
                : t("upload.submit", { count: queue.total })}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
