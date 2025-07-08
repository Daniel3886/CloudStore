"use client"

import type React from "react"

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
  Edit,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  s3Key: string
  displayName: string
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
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [newFileName, setNewFileName] = useState("")
  const [renameLoading, setRenameLoading] = useState(false)

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
          const displayName = file.displayName || file.display_name || "Unknown File"
          const s3Key = file.key || ""

          const fileType = getFileTypeFromName(displayName)
          return {
            id: `file-${index}`,
            name: displayName, 
            s3Key: s3Key,
            displayName: displayName,
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
    if (type === "shared") return file.owner !== "Current User"
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
    if (!file.s3Key) {
      showError("Missing key", "Cannot download file without S3 key.")
      return
    }
    setFileLoading(file.id, true)
    try {
      const headers: Record<string, string> = {}
      const accessToken = localStorage.getItem("accessToken")
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`
      }
      const response = await fetch(`http://localhost:8080/file/download/${encodeURIComponent(file.s3Key)}`, {
        method: "GET",
        headers,
        credentials: "include",
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = file.displayName 
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
        showSuccess("Download started", `${file.displayName} is being downloaded.`)
      } else if (response.status === 401) {
        const refreshSuccess = await refreshAccessToken()
        if (refreshSuccess) {
          const newAccessToken = localStorage.getItem("accessToken")
          if (newAccessToken) {
            headers["Authorization"] = `Bearer ${newAccessToken}`
          }
          const retryResponse = await fetch(`http://localhost:8080/file/download/${encodeURIComponent(file.s3Key)}`, {
            method: "GET",
            headers,
            credentials: "include",
          })
          if (retryResponse.ok) {
            const blob = await retryResponse.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = file.displayName
            document.body.appendChild(link)
            link.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(link)
            showSuccess("Download started", `${file.displayName} is being downloaded.`)
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
    if (!file.s3Key) {
      showError("Missing key", "Cannot delete file without S3 key.")
      return
    }
    setFileLoading(file.id, true)
    try {
      const headers: Record<string, string> = {}
      const accessToken = localStorage.getItem("accessToken")
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`
      }
      const response = await fetch(`http://localhost:8080/file/delete/${encodeURIComponent(file.s3Key)}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      })
      console.log("Delete response:", response)
      if (response.ok) {
        const result = await response.text()
        showSuccess("File deleted", `${file.displayName} has been deleted successfully.`)
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
          const retryResponse = await fetch(`http://localhost:8080/file/delete/${encodeURIComponent(file.s3Key)}`, {
            method: "DELETE",
            headers,
            credentials: "include",
          })
          console.log("Retry delete response:", retryResponse)
          if (retryResponse.ok) {
            showSuccess("File deleted", `${file.displayName} has been deleted successfully.`)
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

  const renameFile = async (file: any, newName: string) => {
    if (!file.s3Key) {
      showError("Missing key", "Cannot rename file without S3 key.")
      return
    }

    if (!newName.trim()) {
      showError("Invalid name", "File name cannot be empty.")
      return
    }

    if (newName === file.displayName) {
      setRenameDialogOpen(false)
      setSelectedFile(null)
      setNewFileName("")
      return
    }

    setRenameLoading(true)
    try {
      const headers: Record<string, string> = {}
      const accessToken = localStorage.getItem("accessToken")
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`
      }

      const url = new URL("http://localhost:8080/file/rename")
      url.searchParams.append("s3Key", file.s3Key)
      url.searchParams.append("newDisplayName", newName.trim())

      const response = await fetch(url.toString(), {
        method: "PATCH",
        headers,
        credentials: "include",
      })

      if (response.ok) {
        showSuccess("File renamed", `File renamed to "${newName}" successfully.`)
        await fetchFiles()
        if (onRefresh) {
          onRefresh()
        }
        setRenameDialogOpen(false)
        setSelectedFile(null)
        setNewFileName("")
      } else if (response.status === 401) {
        const refreshSuccess = await refreshAccessToken()
        if (refreshSuccess) {
          const newAccessToken = localStorage.getItem("accessToken")
          if (newAccessToken) {
            headers["Authorization"] = `Bearer ${newAccessToken}`
          }

          const retryUrl = new URL("http://localhost:8080/file/rename")
          retryUrl.searchParams.append("s3Key", file.s3Key)
          retryUrl.searchParams.append("newDisplayName", newName.trim())

          const retryResponse = await fetch(retryUrl.toString(), {
            method: "PATCH",
            headers,
            credentials: "include",
          })
          if (retryResponse.ok) {
            showSuccess("File renamed", `File renamed to "${newName}" successfully.`)
            await fetchFiles()
            if (onRefresh) {
              onRefresh()
            }
            setRenameDialogOpen(false)
            setSelectedFile(null)
            setNewFileName("")
          } else {
            throw new Error("Rename failed after token refresh")
          }
        } else {
          throw new Error("Authentication failed. Please log in again.")
        }
      } else {
        const errorText = await response.text()
        throw new Error(errorText || `Rename failed: ${response.status}`)
      }
    } catch (error: any) {
      showError("Rename failed", error.message || "Failed to rename file.")
    } finally {
      setRenameLoading(false)
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
      case "rename":
        setNewFileName(file.displayName) 
        setRenameDialogOpen(true)
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

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFile && newFileName.trim()) {
      renameFile(selectedFile, newFileName.trim())
    } else if (selectedFile && !newFileName.trim()) {
      showError("Invalid name", "File name cannot be empty.")
    }
  }

  const getFileExtension = (fileName: string) => {
    const lastDotIndex = fileName.lastIndexOf(".")
    return lastDotIndex > 0 ? fileName.substring(lastDotIndex) : ""
  }

  const getFileNameWithoutExtension = (fileName: string) => {
    const lastDotIndex = fileName.lastIndexOf(".")
    return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName
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
                      <DropdownMenuItem onClick={() => handleFileAction("rename", file)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
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
                  <h3 className="font-medium truncate" title={file.displayName}>
                    {file.displayName}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedFile?.displayName}"? This action cannot be undone.
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

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename file</DialogTitle>
            <DialogDescription>
              Enter a new name for "{selectedFile?.displayName}". The file extension will be preserved.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRenameSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="filename">File name</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="filename"
                    value={getFileNameWithoutExtension(newFileName)}
                    onChange={(e) => {
                      const extension = getFileExtension(selectedFile?.displayName || "")
                      if (e.target.value.trim()) {
                        setNewFileName(e.target.value + extension)
                      } else {
                        setNewFileName("")
                      }
                    }}
                    placeholder="Enter file name"
                    disabled={renameLoading}
                    className="flex-1"
                  />
                  {getFileExtension(selectedFile?.displayName || "") && (
                    <span className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded">
                      {getFileExtension(selectedFile?.displayName || "")}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRenameDialogOpen(false)
                  setSelectedFile(null)
                  setNewFileName("")
                }}
                disabled={renameLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={renameLoading || !newFileName.trim()}>
                {renameLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Renaming...
                  </>
                ) : (
                  "Rename"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {selectedFile && (
        <>
          <ShareModal open={shareOpen} onOpenChange={setShareOpen} file={selectedFile} />
          <FileDetailsModal open={detailsOpen} onOpenChange={setDetailsOpen} file={selectedFile} />
        </>
      )}
    </>
  )
}
