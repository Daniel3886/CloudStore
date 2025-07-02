"use client"

import { useState, useEffect } from "react"
import {
  FileIcon,
  FileTextIcon,
  FolderIcon,
  ImageIcon,
  MoreVertical,
  FileArchiveIcon,
  FileAudioIcon,
  FileVideoIcon,
  Download,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ShareModal } from "./share-modal"
import { FileDetailsModal } from "./file-details-modal"
import { showSuccess, showError } from "@/components/ui/notification"

interface FileItem {
  id: string
  name: string
  type: string
  size: number | null
  modified: string
  owner?: string
}

interface FileBrowserProps {
  type?: "all" | "shared" | "recent" | "trash"
  onRefresh?: () => void
}

export function FileBrowser({ type = "all", onRefresh }: FileBrowserProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const fetchFiles = async () => {
    setLoading(true)

    try {
      const headers: Record<string, string> = {}
      const accessToken = localStorage.getItem("accessToken")
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`
      }

      const response = await fetch("http://localhost:8080/file/list", {
        method: "GET",
        headers,
        credentials: "include",
      })

      if (response.ok) {
        
        const data = await response.json()
        console.log("Fetched files:", data)
        const transformedFiles = data.map((file: any, index: number) => {

        const originalKey = file.key || ""
        const fileName = originalKey.split("-").slice(1).join("-") // removes timestamp prefix
        const fileType = getFileTypeFromName(fileName)

          return {
            id: `file-${index}`,
            name: fileName,
            type: fileType,
            size: file.size || null,
            modified: file.lastModified || new Date().toISOString(),
            owner: "Unknown",
          }
        })

        console.log("Transformed files:", transformedFiles)
        setFiles(transformedFiles)
      } else if (response.status === 401) {
        const refreshSuccess = await refreshAccessToken()
        if (refreshSuccess) {
          await fetchFiles()
          return
        }
        throw new Error("Authentication failed. Please log in again.")
      } else {
        throw new Error(`Failed to fetch files: ${response.status}`)
      }
    } catch (error: any) {
      console.error("Error fetching files:", error)
      showError("Failed to load files", error.message || "Could not load files from server")
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [type])

  const getFileTypeFromName = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    if (!extension) return "file"

    const imageExtensions = ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"]
    const documentExtensions = ["pdf", "doc", "docx", "txt", "rtf", "odt"]
    const videoExtensions = ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"]
    const audioExtensions = ["mp3", "wav", "flac", "aac", "ogg", "wma"]
    const archiveExtensions = ["zip", "rar", "7z", "tar", "gz", "bz2"]

    if (imageExtensions.includes(extension)) return "image"
    if (documentExtensions.includes(extension)) return "document"
    if (extension === "pdf") return "pdf"
    if (videoExtensions.includes(extension)) return "video"
    if (audioExtensions.includes(extension)) return "audio"
    if (archiveExtensions.includes(extension)) return "archive"

    return "file"
  }

  const filteredFiles = files.filter((file) => {
    if (type === "all") return true
    if (type === "shared") return file.owner !== "Current User" // Adjust based on your user system (Not implemented yet)
    if (type === "recent") {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return new Date(file.modified) > oneWeekAgo
    }
    return true
  })

  const formatSize = (bytes: number | null) => {
    if (bytes === null) return ""
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "folder":
        return <FolderIcon className="h-10 w-10 text-blue-500" />
      case "image":
        return <ImageIcon className="h-10 w-10 text-green-500" />
      case "pdf":
      case "document":
        return <FileTextIcon className="h-10 w-10 text-red-500" />
      case "archive":
        return <FileArchiveIcon className="h-10 w-10 text-yellow-500" />
      case "audio":
        return <FileAudioIcon className="h-10 w-10 text-purple-500" />
      case "video":
        return <FileVideoIcon className="h-10 w-10 text-pink-500" />
      default:
        return <FileIcon className="h-10 w-10 text-gray-500" />
    }
  }

  const setFileLoading = (fileId: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [fileId]: loading }))
  }

  const refreshAccessToken = async (): Promise<boolean> => {
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
  }

  const downloadFile = async (file: any) => {
    if (file.type === "folder") {
      showError("Cannot download folder", "Folder downloads are not supported yet.")
      return
    }

    setFileLoading(file.id, true)

    try {
      const headers: Record<string, string> = {}

      const accessToken = localStorage.getItem("accessToken")
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`
      }

      const response = await fetch(`http://localhost:8080/file/download/${encodeURIComponent(file.name)}`, {
        method: "GET",
        headers,
        credentials: "include",
      })

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

        showSuccess("Download started", `${file.name} is being downloaded.`)
      } else if (response.status === 401) {
        const refreshSuccess = await refreshAccessToken()
        if (refreshSuccess) {
          const newAccessToken = localStorage.getItem("accessToken")
          if (newAccessToken) {
            headers["Authorization"] = `Bearer ${newAccessToken}`
          }

          const retryResponse = await fetch(`http://localhost:8080/file/download/${encodeURIComponent(file.name)}`, {
            method: "GET",
            headers,
            credentials: "include",
          })

          if (retryResponse.ok) {
            const blob = await retryResponse.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = file.name
            document.body.appendChild(link)
            link.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(link)
            showSuccess("Download started", `${file.name} is being downloaded.`)
          } else {
            throw new Error("Download failed after token refresh")
          }
        } else {
          throw new Error("Authentication failed. Please log in again.")
        }
      } else {
        const errorText = await response.text()
        throw new Error(errorText || `Download failed: ${response.status}`)
      }
    } catch (error: any) {
      showError("Download failed", error.message || "Failed to download file.")
    } finally {
      setFileLoading(file.id, false)
    }
  }

  const deleteFile = async (file: any) => {
    if (file.type === "folder") {
      showError("Cannot delete folder", "Folder deletion is not supported yet.")
      return
    }

    setFileLoading(file.id, true)

    try {
      const headers: Record<string, string> = {}

      const accessToken = localStorage.getItem("accessToken")
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`
      }

      const response = await fetch(`http://localhost:8080/file/delete/${encodeURIComponent(file.name)}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.text()
        showSuccess("File deleted", `${file.name} has been deleted successfully.`)

        await fetchFiles()
        if (onRefresh) {
          onRefresh()
        }
      } else if (response.status === 401) {
        const refreshSuccess = await refreshAccessToken()
        if (refreshSuccess) {
          const newAccessToken = localStorage.getItem("accessToken")
          if (newAccessToken) {
            headers["Authorization"] = `Bearer ${newAccessToken}`
          }

          const retryResponse = await fetch(`http://localhost:8080/file/delete/${encodeURIComponent(file.name)}`, {
            method: "DELETE",
            headers,
            credentials: "include",
          })

          if (retryResponse.ok) {
            showSuccess("File deleted", `${file.name} has been deleted successfully.`)
            await fetchFiles()
            if (onRefresh) {
              onRefresh()
            }
          } else {
            throw new Error("Delete failed after token refresh")
          }
        } else {
          throw new Error("Authentication failed. Please log in again.")
        }
      } else {
        const errorText = await response.text()
        throw new Error(errorText || `Delete failed: ${response.status}`)
      }
    } catch (error: any) {
      showError("Delete failed", error.message || "Failed to delete file.")
    } finally {
      setFileLoading(file.id, false)
      setDeleteDialogOpen(false)
      setSelectedFile(null)
    }
  }

  const handleFileAction = (action: string, file: any) => {
    setSelectedFile(file)

    switch (action) {
      case "download":
        downloadFile(file)
        break
      case "share":
        setShareOpen(true)
        break
      case "details":
        setDetailsOpen(true)
        break
      case "delete":
        setDeleteDialogOpen(true)
        break
      case "refresh":
        fetchFiles()
        break
      default:
        showError("Action not implemented", `${action} functionality is not implemented yet.`)
    }
  }

  const handleRefresh = async () => {
    await fetchFiles()
    if (onRefresh) {
      onRefresh()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading files...</p>
        </div>
      </div>
    )
  }

  if (filteredFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No files found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {type === "all" ? "Upload some files to get started" : `No ${type} files found`}
        </p>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFiles.map((file) => (
          <Card key={file.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  {getFileIcon(file.type)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="-mr-2 -mt-2" disabled={loadingStates[file.id]}>
                        {loadingStates[file.id] ? (
                          <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleFileAction("download", file)}
                        disabled={file.type === "folder"}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFileAction("share", file)}>Share</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFileAction("rename", file)}>Rename</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFileAction("move", file)}>Move</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleFileAction("details", file)}>Details</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleFileAction("delete", file)}
                        className="text-red-500"
                        disabled={file.type === "folder"}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-4">
                  <h3 className="font-medium truncate" title={file.name}>
                    {file.name}
                  </h3>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {file.type === "folder" ? <p>Folder</p> : <p>{formatSize(file.size)}</p>}
                    <p>Modified {formatDate(file.modified)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedFile?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedFile(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedFile && deleteFile(selectedFile)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Existing Modals */}
      {selectedFile && (
        <>
          <ShareModal open={shareOpen} onOpenChange={setShareOpen} file={selectedFile} />
          <FileDetailsModal open={detailsOpen} onOpenChange={setDetailsOpen} file={selectedFile} />
        </>
      )}
    </>
  )
}
