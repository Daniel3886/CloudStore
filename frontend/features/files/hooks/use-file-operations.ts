"use client"

import { useCallback, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "@/hooks/use-toast"
import { useErrorMessage } from "@/hooks/use-error-message"
import { saveBlob } from "@/lib/download"
import { filesApi } from "@/features/files/api"
import { getItemPath } from "@/features/files/lib/file-filters"
import { joinPath } from "@/features/files/lib/file-utils"
import type { FileItem } from "@/features/files/types"

type MissingKeyAction = "download" | "delete" | "restore" | "permanentDelete"

const kindOf = (file: FileItem) => (file.isFolder ? "folder" : "file")

export function useFileOperations() {
  const t = useTranslations("files.toasts")
  const errorMessage = useErrorMessage()
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({})

  const withLoading = useCallback(async <T>(fileId: number, task: () => Promise<T>): Promise<T> => {
    setLoadingStates((prev) => ({ ...prev, [fileId]: true }))
    try {
      return await task()
    } finally {
      setLoadingStates((prev) => ({ ...prev, [fileId]: false }))
    }
  }, [])

  const requireKey = useCallback(
    (file: FileItem, action: MissingKeyAction): file is FileItem & { s3Key: string } => {
      if (file.s3Key) return true
      toast({ variant: "destructive", title: t("missingKey.title"), description: t(`missingKey.${action}`) })
      return false
    },
    [t],
  )

  const downloadFile = useCallback(
    async (file: FileItem): Promise<void> => {
      if (!requireKey(file, "download")) return
      await withLoading(file.id, async () => {
        try {
          saveBlob(await filesApi.download(file.s3Key), file.name)
          toast({
            variant: "success",
            title: t("downloadStarted.title"),
            description: t("downloadStarted.file", { name: file.name }),
          })
        } catch (error) {
          toast({
            variant: "destructive",
            title: t("downloadFailed.title"),
            description: errorMessage(error, t("downloadFailed.file")),
          })
        }
      })
    },
    [errorMessage, requireKey, withLoading, t],
  )

  const downloadFolder = useCallback(
    async (folder: FileItem, filesInFolder: FileItem[]): Promise<void> => {
      const downloadable = filesInFolder.filter((file) => file.s3Key)
      if (downloadable.length === 0) {
        toast({
          variant: "destructive",
          title: t("emptyFolder.title"),
          description: t("emptyFolder.description"),
        })
        return
      }

      await withLoading(folder.id, async () => {
        try {
          const folderPath = getItemPath(folder)
          const JSZip = (await import("jszip")).default
          const zip = new JSZip()
          let failed = 0

          for (const file of downloadable) {
            try {
              const relativeDir = file.path.slice(folderPath.length + 1)
              zip.file(joinPath(relativeDir, file.name), await filesApi.download(file.s3Key as string))
            } catch {
              failed++
            }
          }

          if (failed === downloadable.length) throw new Error(t("downloadFailed.folder"))

          saveBlob(await zip.generateAsync({ type: "blob" }), `${folder.name}.zip`)
          toast({
            variant: "success",
            title: t("downloadStarted.title"),
            description: t("downloadStarted.folder", { name: folder.name }),
          })
          if (failed > 0) {
            toast({
              variant: "destructive",
              title: t("partialFolderDownload.title"),
              description: t("partialFolderDownload.description", { count: failed }),
            })
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: t("downloadFailed.title"),
            description: errorMessage(error, t("downloadFailed.folder")),
          })
        }
      })
    },
    [errorMessage, withLoading, t],
  )

  const deleteFile = useCallback(
    async (file: FileItem): Promise<boolean> => {
      if (!file.isFolder && !requireKey(file, "delete")) return false
      return withLoading(file.id, async () => {
        try {
          if (file.isFolder) {
            await filesApi.deleteFolder(getItemPath(file))
          } else {
            await filesApi.moveToTrash(file.s3Key as string)
          }
          toast({
            variant: "success",
            title: t("deleted.title", { kind: kindOf(file) }),
            description: t("deleted.description", { name: file.name }),
          })
          return true
        } catch (error) {
          toast({
            variant: "destructive",
            title: t("deleteFailed.title"),
            description: errorMessage(error, t("deleteFailed.description", { kind: kindOf(file) })),
          })
          return false
        }
      })
    },
    [errorMessage, requireKey, withLoading, t],
  )

  const renameFile = useCallback(
    async (file: FileItem, newName: string): Promise<string | null> => {
      if (!file.isFolder && !file.s3Key) return t("missingKey.rename")
      if (newName === file.name) return null

      return withLoading(file.id, async () => {
        try {
          if (file.isFolder) {
            await filesApi.renameFolder(getItemPath(file), joinPath(file.path, newName))
          } else {
            await filesApi.rename(file.s3Key as string, joinPath(file.path, newName))
          }
          toast({
            variant: "success",
            title: t("renamed.title", { kind: kindOf(file) }),
            description: t("renamed.description", { kind: kindOf(file), name: newName }),
          })
          return null
        } catch (error) {
          return errorMessage(error, t("renameFailed", { kind: kindOf(file) }))
        }
      })
    },
    [errorMessage, withLoading, t],
  )

  const restoreFile = useCallback(
    async (file: FileItem): Promise<boolean> => {
      if (!requireKey(file, "restore")) return false
      return withLoading(file.id, async () => {
        try {
          await filesApi.restore(file.s3Key)
          toast({
            variant: "success",
            title: t("restored.title"),
            description: t("restored.description", { name: file.name }),
          })
          return true
        } catch (error) {
          toast({
            variant: "destructive",
            title: t("restoreFailed.title"),
            description: errorMessage(error, t("restoreFailed.description")),
          })
          return false
        }
      })
    },
    [errorMessage, requireKey, withLoading, t],
  )

  const permanentlyDeleteFile = useCallback(
    async (file: FileItem): Promise<boolean> => {
      if (!requireKey(file, "permanentDelete")) return false
      return withLoading(file.id, async () => {
        try {
          await filesApi.deletePermanently(file.s3Key)
          toast({
            variant: "success",
            title: t("permanentlyDeleted.title"),
            description: t("permanentlyDeleted.description", { name: file.name }),
          })
          return true
        } catch (error) {
          toast({
            variant: "destructive",
            title: t("permanentDeleteFailed.title"),
            description: errorMessage(error, t("permanentDeleteFailed.description")),
          })
          return false
        }
      })
    },
    [errorMessage, requireKey, withLoading, t],
  )

  return {
    loadingStates,
    downloadFile,
    downloadFolder,
    deleteFile,
    renameFile,
    restoreFile,
    permanentlyDeleteFile,
  }
}
