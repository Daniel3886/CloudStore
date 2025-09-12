"use client"

import { useState, useCallback } from "react"
import { toast } from "@/hooks/use-toast"
import { FileItem } from "@/lib/file"

export function useFileOperations() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const setFileLoading = useCallback((fileId: number, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [fileId]: loading }))
  }, [])

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (!refreshToken) {
        return false
      }

      const response = await fetch("http://localhost:8080/auth/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("accessToken", data.accessToken)
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken)
        }
        return true
      } else {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("userEmail")
        return false
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
      return false
    }
  }, [])

  const makeAuthenticatedRequest = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      
    const headers: Record<string, string> = {
      ...(options.headers instanceof Headers
        ? Object.fromEntries(options.headers.entries())
        : Array.isArray(options.headers)
          ? Object.fromEntries(options.headers)
          : (options.headers as Record<string, string> | undefined) ?? {}),
    };

      const accessToken = localStorage.getItem("accessToken")
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`
      }

      let response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      })

      if (response.status === 401) {
        const refreshSuccess = await refreshAccessToken()
        if (refreshSuccess) {
          const newAccessToken = localStorage.getItem("accessToken")
          if (newAccessToken) {
            headers["Authorization"] = `Bearer ${newAccessToken}`
          }

          response = await fetch(url, {
            ...options,
            headers,
            credentials: "include",
          })
        }
      }

      return response
    },
    [refreshAccessToken],
  )

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
        const response = await makeAuthenticatedRequest(
          `http://localhost:8080/file/download?s3Key=${encodeURIComponent(file.s3Key)}`,
          {
            method: "GET",
          },
        )

        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = file.name
          document.body.appendChild(link)
          link.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(link)

          toast({
            variant: "success",
            title: "Download started",
            description: `${file.name} is being downloaded.`,
          })
        } else {
          const errorText = await response.text()
          throw new Error(errorText || `Download failed: ${response.status}`)
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Download failed",
          description: error.message || "Failed to download file.",
        })
      } finally {
        setFileLoading(file.id, false)
      }
    },
    [makeAuthenticatedRequest, setFileLoading],
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
          try {
            const response = await makeAuthenticatedRequest(
              `http://localhost:8080/file/download?s3Key=${encodeURIComponent(file.s3Key!)}`,
              {
                method: "GET",
              },
            )

            if (response.ok) {
              const blob = await response.blob()
              zip.file(file.name, blob)
            } else {
              console.error(`Failed to download ${file.name}: ${response.status}`)
            }
          } catch (error) {
            console.error(`Failed to download file ${file.name}:`, error)
          }
        }

        const zipBlob = await zip.generateAsync({ type: "blob" })
        const url = window.URL.createObjectURL(zipBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${folder.name}.zip`
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)

        toast({
          variant: "success",
          title: "Download started",
          description: `Folder "${folder.name}" is being downloaded as a zip file.`,
        })
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Download failed",
          description: error.message || "Failed to download folder.",
        })
      } finally {
        setFileLoading(folder.id, false)
      }
    },
    [makeAuthenticatedRequest, setFileLoading],
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
        let response: Response

        if (file.isFolder) {
          const folderPath = file.path ? `${file.path}/${file.name}` : file.name
          response = await makeAuthenticatedRequest(
            `http://localhost:8080/file/delete-folder?folderPath=${encodeURIComponent(folderPath)}`,
            {
              method: "DELETE",
            },
          )
        } else {
          response = await makeAuthenticatedRequest(
            `http://localhost:8080/file/delete?fileName=${encodeURIComponent(file.s3Key!)}`,
            {
              method: "DELETE",
            },
          )
        }

        if (response.ok) {
          toast({
            variant: "success",
            title: `${file.isFolder ? "Folder" : "File"} deleted`,
            description: `${file.name} has been deleted successfully.`,
          })
          onSuccess()
        } else {
          const errorText = await response.text()
          throw new Error(errorText || `Delete failed: ${response.status}`)
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Delete failed",
          description: error.message || `Failed to delete ${file.isFolder ? "folder" : "file"}.`,
        })
      } finally {
        setFileLoading(file.id, false)
      }
    },
    [makeAuthenticatedRequest, setFileLoading],
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
        let response: Response

        if (file.isFolder) {
          const oldFolderPath = currentPath ? `${currentPath}/${file.name}` : file.name
          const newFolderPath = currentPath ? `${currentPath}/${newName}` : newName

          response = await makeAuthenticatedRequest(
            `http://localhost:8080/file/rename-folder?oldFolderPath=${encodeURIComponent(oldFolderPath)}&newFolderPath=${encodeURIComponent(newFolderPath)}`,
            {
              method: "PATCH",
            },
          )
        } else {
          const newDisplayName = currentPath ? `${currentPath}/${newName}` : newName
          const url = new URL("http://localhost:8080/file/rename")
          url.searchParams.append("s3Key", file.s3Key!)
          url.searchParams.append("newDisplayName", newDisplayName)

          response = await makeAuthenticatedRequest(url.toString(), {
            method: "PATCH",
          })
        }

        if (response.ok) {
          toast({
            variant: "success",
            title: `${file.isFolder ? "Folder" : "File"} renamed`,
            description: `${file.isFolder ? "Folder" : "File"} renamed to "${newName}" successfully.`,
          })
          onSuccess()
          return ""
        } else {
          const errorText = await response.text()
          throw new Error(errorText || `Rename failed: ${response.status}`)
        }
      } catch (error: any) {
        return error.message || `Failed to rename ${file.isFolder ? "folder" : "file"}.`
      }
    },
    [makeAuthenticatedRequest],
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
        const url = new URL("http://localhost:8080/file/restore")
        url.searchParams.append("s3Key", file.s3Key as string)
        const response = await makeAuthenticatedRequest(url.toString(), { method: "POST" })

        if (response.ok) {
          toast({
            variant: "success",
            title: "File restored",
            description: `${file.name} has been restored from trash.`,
          })
          onSuccess()
        } else {
          const errorText = await response.text().catch(() => "")
          throw new Error(errorText || `Restore failed: ${response.status}`)
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Restore failed",
          description: error?.message || "Failed to restore file.",
        })
      } finally {
        setFileLoading(file.id, false)
      }
    },
    [makeAuthenticatedRequest, setFileLoading],
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
        const response = await makeAuthenticatedRequest(
          `http://localhost:8080/file/${encodeURIComponent(file.s3Key)}/permanent`,
          {
            method: "DELETE",
          },
        )

        if (response.ok) {
          toast({
            variant: "success",
            title: "File permanently deleted",
            description: `${file.name} has been permanently deleted.`,
          })
          onSuccess()
        } else {
          const errorText = await response.text()
          throw new Error(errorText || `Permanent delete failed: ${response.status}`)
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Permanent delete failed",
          description: error.message || "Failed to permanently delete file.",
        })
      } finally {
        setFileLoading(file.id, false)
      }
    },
    [makeAuthenticatedRequest, setFileLoading],
  )

  return {
    loadingStates,
    downloadFile,
    downloadFolder,
    deleteFile,
    renameFile,
    restoreFile,
    permanentlyDeleteFile,
    makeAuthenticatedRequest,
  }
}
