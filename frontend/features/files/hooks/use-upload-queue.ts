"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { useErrorMessage } from "@/hooks/use-error-message"
import { filesApi } from "@/features/files/api"
import { getUniqueFileName, joinPath } from "@/features/files/lib/file-utils"

export type UploadStatus = "pending" | "uploading" | "completed" | "error"

export interface UploadItem {
  id: number
  file: File
  status: UploadStatus
  error?: string
}

export interface UploadResult {
  succeeded: number
  failed: number
}

function renameFile(file: File, name: string): File {
  return name === file.name ? file : new File([file], name, { type: file.type, lastModified: file.lastModified })
}

export function useUploadQueue(currentPath: string) {
  const t = useTranslations("files.toasts.uploadFailed")
  const errorMessage = useErrorMessage()
  const [items, setItems] = useState<UploadItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const nextIdRef = useRef(0)

  const updateItem = useCallback((id: number, patch: Partial<UploadItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }, [])

  const addFiles = useCallback((files: Iterable<File>) => {
    const incoming = Array.from(files)
    if (incoming.length === 0) return
    setItems((prev) => {
      const taken = new Set(prev.map((item) => item.file.name))
      const added = incoming.map((file) => {
        const name = getUniqueFileName(file.name, taken)
        taken.add(name)
        return { id: nextIdRef.current++, file: renameFile(file, name), status: "pending" as const }
      })
      return [...prev, ...added]
    })
  }, [])

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const uploadAll = useCallback(async (): Promise<UploadResult> => {
    const pending = items.filter((item) => item.status === "pending")
    const result: UploadResult = { succeeded: 0, failed: 0 }
    if (pending.length === 0) return result

    setIsUploading(true)
    for (const item of pending) {
      updateItem(item.id, { status: "uploading", error: undefined })
      try {
        await filesApi.upload(item.file, joinPath(currentPath, item.file.name))
        updateItem(item.id, { status: "completed" })
        result.succeeded++
      } catch (error) {
        updateItem(item.id, { status: "error", error: errorMessage(error, t("fallback")) })
        result.failed++
      }
    }
    setIsUploading(false)
    return result
  }, [errorMessage, items, currentPath, updateItem, t])

  const summary = useMemo(() => {
    const done = items.filter((item) => item.status === "completed" || item.status === "error").length
    return {
      total: items.length,
      pendingCount: items.filter((item) => item.status === "pending").length,
      currentNumber: Math.min(done + 1, items.length),
      isFinished: items.length > 0 && done === items.length,
      hasErrors: items.some((item) => item.status === "error"),
    }
  }, [items])

  return { items, isUploading, addFiles, removeItem, clear, uploadAll, ...summary }
}
