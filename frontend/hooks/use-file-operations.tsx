"use client"

import { useState, useCallback } from "react"
import { toast } from "@/hooks/use-toast"
import { getErrorMessage } from "@/lib/api/client"
import { filesApi } from "@/lib/api/files"
import { saveBlob } from "@/lib/download"
import { FileItem } from "@/lib/file"

export function useFileOperations() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const setFileLoading = useCallback((fileId: number, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [fileId]: loading }))
  }, [])

  const downloadFile = useCallback(
    async (file: FileItem): Promise<void> => {
      if (!file.s3Key) {
        toast({
          variant: "destructive",
          title: "Missing key",
          description: "Cannot download file without S3 key.",
        })
        return
      }

      setFileLoading(file.id, true)

      try {
        saveBlob(await filesApi.download(file.s3Key), file.name)
        toast({
          variant: "success",
          title: "Download started",
          description: `${file.name} is being downloaded.`,
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Download failed",
          description: getErrorMessage(error, "Failed to download file."),
        })
      } finally {
        setFileLoading(file.id, false)
      }
    },
    [setFileLoading],
  )

  const downloadFolder = useCallback(
    async (folder: FileItem, filesInFolder: FileItem[]): Promise<void> => {
      setFileLoading(folder.id, true)

      try {
        if (filesInFolder.length === 0) {
          toast({
            variant: "destructive",
            title: "Empty folder",
            description: "This folder contains no files to download.",
          })
          return
        }

        const JSZip = (await import("jszip")).default
        const zip = new JSZip()

        for (const file of filesInFolder) {
          if (!file.s3Key) continue
          try {
            zip.file(file.name, await filesApi.download(file.s3Key))
          } catch (error) {
            console.error(`Failed to download file ${file.name}:`, error)
          }
        }

        saveBlob(await zip.generateAsync({ type: "blob" }), `${folder.name}.zip`)

        toast({
          variant: "success",
          title: "Download started",
          description: `Folder "${folder.name}" is being downloaded as a zip file.`,
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Download failed",
          description: getErrorMessage(error, "Failed to download folder."),
        })
      } finally {
        setFileLoading(folder.id, false)
      }
    },
    [setFileLoading],
  )

  const deleteFile = useCallback(
    async (file: FileItem, onSuccess: () => void): Promise<void> => {
      if (!file.s3Key && !file.isFolder) {
        toast({
          variant: "destructive",
          title: "Missing key",
          description: "Cannot delete file without S3 key.",
        })
        return
      }

      setFileLoading(file.id, true)

      try {
        if (file.isFolder) {
          await filesApi.deleteFolder(file.path ? `${file.path}/${file.name}` : file.name)
        } else if (file.s3Key) {
          await filesApi.moveToTrash(file.s3Key)
        }

        toast({
          variant: "success",
          title: `${file.isFolder ? "Folder" : "File"} deleted`,
          description: `${file.name} has been deleted successfully.`,
        })
        onSuccess()
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Delete failed",
          description: getErrorMessage(error, `Failed to delete ${file.isFolder ? "folder" : "file"}.`),
        })
      } finally {
        setFileLoading(file.id, false)
      }
    },
    [setFileLoading],
  )

  const renameFile = useCallback(
    async (file: FileItem, newName: string, currentPath: string, onSuccess: () => void): Promise<string> => {
      if (!file.s3Key && !file.isFolder) {
        return "Cannot rename file without S3 key."
      }

      if (newName === file.name) {
        return ""
      }

      try {
        const withPath = (name: string) => (currentPath ? `${currentPath}/${name}` : name)

        if (file.isFolder) {
          await filesApi.renameFolder(withPath(file.name), withPath(newName))
        } else if (file.s3Key) {
          await filesApi.rename(file.s3Key, withPath(newName))
        }

        toast({
          variant: "success",
          title: `${file.isFolder ? "Folder" : "File"} renamed`,
          description: `${file.isFolder ? "Folder" : "File"} renamed to "${newName}" successfully.`,
        })
        onSuccess()
        return ""
      } catch (error) {
        return getErrorMessage(error, `Failed to rename ${file.isFolder ? "folder" : "file"}.`)
      }
    },
    [],
  )

  const restoreFile = useCallback(
    async (file: FileItem, onSuccess: () => void): Promise<void> => {
      if (!file.s3Key) {
        toast({
          variant: "destructive",
          title: "Missing key",
          description: "Cannot restore file without S3 key.",
        })
        return
      }

      setFileLoading(file.id, true)

      try {
        await filesApi.restore(file.s3Key)
        toast({
          variant: "success",
          title: "File restored",
          description: `${file.name} has been restored from trash.`,
        })
        onSuccess()
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Restore failed",
          description: getErrorMessage(error, "Failed to restore file."),
        })
      } finally {
        setFileLoading(file.id, false)
      }
    },
    [setFileLoading],
  )

  const permanentlyDeleteFile = useCallback(
    async (file: FileItem, onSuccess: () => void): Promise<void> => {
      if (!file.s3Key) {
        toast({
          variant: "destructive",
          title: "Missing key",
          description: "Cannot permanently delete file without S3 key.",
        })
        return
      }

      setFileLoading(file.id, true)

      try {
        await filesApi.deletePermanently(file.s3Key)
        toast({
          variant: "success",
          title: "File permanently deleted",
          description: `${file.name} has been permanently deleted.`,
        })
        onSuccess()
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Permanent delete failed",
          description: getErrorMessage(error, "Failed to permanently delete file."),
        })
      } finally {
        setFileLoading(file.id, false)
      }
    },
    [setFileLoading],
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
