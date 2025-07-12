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
  FolderPlus,
  Upload,
  ArrowLeft,
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
import { UploadModal } from "./upload-modal"
import { showSuccess, showError } from "@/components/ui/notification"

interface FileItem {
  id: string
  name: string
  type: string
  size: number | null
  modified: string
  owner?: string
  s3Key?: string
  displayName: string
  path: string
  isFolder: boolean
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
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [newFileName, setNewFileName] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [renameLoading, setRenameLoading] = useState(false)
  const [currentPath, setCurrentPath] = useState("")

  const [virtualFolders, setVirtualFolders] = useState<string[]>([])

  useEffect(() => {
    const savedFolders = localStorage.getItem("virtualFolders")
    if (savedFolders) {
      setVirtualFolders(JSON.parse(savedFolders))
    }
  }, [])

  const saveVirtualFolders = (folders: string[]) => {
    setVirtualFolders(folders)
    localStorage.setItem("virtualFolders", JSON.stringify(folders))
  }

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

          const pathParts = displayName.split("/")
          const fileName = pathParts.pop() || displayName
          const filePath = pathParts.join("/")

          return {
            id: `file-${index}`,
            name: fileName,
            s3Key: s3Key,
            displayName: displayName,
            type: fileType,
            size: file.size || null,
            modified: file.lastModified || new Date().toISOString(),
            owner: "Unknown",
            path: filePath,
            isFolder: false,
          }
        })

        const folderItems = virtualFolders.map((folderPath, index) => {
          const pathParts = folderPath.split("/")
          const folderName = pathParts.pop() || folderPath
          const parentPath = pathParts.join("/")

          return {
            id: `folder-${index}`,
            name: folderName,
            s3Key: "",
            displayName: folderName,
            type: "folder",
            size: null,
            modified: new Date().toISOString(),
            owner: "You",
            path: parentPath,
            isFolder: true,
          }
        })

        setFiles([...folderItems, ...transformedFiles])
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
  }, [type, virtualFolders])

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
    let typeMatch = true
    if (type === "shared") typeMatch = file.owner !== "You"
    if (type === "recent") {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      typeMatch = new Date(file.modified) > oneWeekAgo
    }

    const pathMatch = file.path === currentPath

    return typeMatch && pathMatch
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

  const createFolder = () => {
    if (!newFolderName.trim()) {
      showError("Invalid name", "Folder name cannot be empty.")
      return
    }

    const folderPath = currentPath ? `${currentPath}/${newFolderName.trim()}` : newFolderName.trim()

    if (virtualFolders.includes(folderPath)) {
      showError("Folder exists", "A folder with this name already exists.")
      return
    }

    const updatedFolders = [...virtualFolders, folderPath]
    saveVirtualFolders(updatedFolders)
    setCreateFolderDialogOpen(false)
    setNewFolderName("")
    showSuccess("Folder created", `Folder "${newFolderName}" created successfully.`)
  }

  const downloadFolder = async (folder: FileItem) => {
    try {
      setFileLoading(folder.id, true)

      const folderPath = currentPath ? `${currentPath}/${folder.name}` : folder.name
      console.log("Downloading folder:", folderPath)

      const filesInFolder = files.filter((file) => {
        if (file.isFolder) return false 
        return file.displayName.startsWith(folderPath + "/")
      })

      console.log("Files in folder:", filesInFolder)

      if (filesInFolder.length === 0) {
        showError("Empty folder", "This folder contains no files to download.")
        return
      }

      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      for (const file of filesInFolder) {
        try {
          console.log("Downloading file:", file.s3Key, file.displayName)

          const headers: Record<string, string> = {}
          const accessToken = localStorage.getItem("accessToken")
          if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`
          }

          const response = await fetch(`http://localhost:8080/file/download?s3Key=${encodeURIComponent(file.s3Key!)}`, {
            method: "GET",
            headers,
            credentials: "include",
          })

          if (response.ok) {
            const blob = await response.blob()
            const relativePath = file.displayName.replace(folderPath + "/", "")
            console.log("Adding to zip:", relativePath)
            zip.file(relativePath, blob)
          } else {
            console.error(`Failed to download ${file.name}: ${response.status}`)
          }
        } catch (error) {
          console.error(`Failed to download file ${file.name}:`, error)
        }
      }

      console.log("Generating zip...")
      const zipBlob = await zip.generateAsync({ type: "blob" })
      const url = window.URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${folder.name}.zip`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)

      showSuccess("Download started", `Folder "${folder.name}" is being downloaded as a zip file.`)
    } catch (error: any) {
      console.error("Download folder error:", error)
      showError("Download failed", error.message || "Failed to download folder.")
    } finally {
      setFileLoading(folder.id, false)
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
      const response = await fetch(`http://localhost:8080/file/download?s3Key=${encodeURIComponent(file.s3Key!)}`, {
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
          const retryResponse = await fetch(`http://localhost:8080/file/download?s3Key=${encodeURIComponent(file.s3Key)}`, {
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
    if (file.isFolder) {
      const folderPath = currentPath ? `${currentPath}/${file.name}` : file.name
      const updatedFolders = virtualFolders.filter((folder) => !folder.startsWith(folderPath))
      saveVirtualFolders(updatedFolders)

      showSuccess("Folder deleted", `Folder "${file.name}" has been deleted.`)
      setDeleteDialogOpen(false)
      setSelectedFile(null)
      return
    }

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
      if (response.ok) {
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
    if (file.isFolder) {
      const oldFolderPath = currentPath ? `${currentPath}/${file.name}` : file.name
      const newFolderPath = currentPath ? `${currentPath}/${newName.trim()}` : newName.trim()

      const updatedFolders = virtualFolders.map((folder) => {
        if (folder === oldFolderPath) {
          return newFolderPath
        }
        if (folder.startsWith(oldFolderPath + "/")) {
          return folder.replace(oldFolderPath, newFolderPath)
        }
        return folder
      })

      saveVirtualFolders(updatedFolders)
      showSuccess("Folder renamed", `Folder renamed to "${newName}" successfully.`)
      setRenameDialogOpen(false)
      setSelectedFile(null)
      setNewFileName("")
      return
    }

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

      const newDisplayName = currentPath ? `${currentPath}/${newName.trim()}` : newName.trim()

      const url = new URL("http://localhost:8080/file/rename")
      url.searchParams.append("s3Key", file.s3Key)
      url.searchParams.append("newDisplayName", newDisplayName)

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
          retryUrl.searchParams.append("newDisplayName", newDisplayName)

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
        if (file.isFolder) {
          downloadFolder(file)
        } else {
          downloadFile(file)
        }
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
      showError("Invalid name", "Name cannot be empty.")
    }
  }

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createFolder()
  }

  const handleFileClick = (file: FileItem) => {
    if (file.isFolder) {
      const newPath = currentPath ? `${currentPath}/${file.name}` : file.name
      setCurrentPath(newPath)
    }
  }

  const handleBackClick = () => {
    const pathParts = currentPath.split("/")
    pathParts.pop()
    setCurrentPath(pathParts.join("/"))
  }

  const getFileExtension = (fileName: string) => {
    const lastDotIndex = fileName.lastIndexOf(".")
    return lastDotIndex > 0 ? fileName.substring(lastDotIndex) : ""
  }

  const getFileNameWithoutExtension = (fileName: string) => {
    const lastDotIndex = fileName.lastIndexOf(".")
    return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName
  }

  const getBreadcrumbs = () => {
    if (!currentPath) return ["My Files"]
    return ["My Files", ...currentPath.split("/")]
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

  return (
    <>
      {/* Header with breadcrumbs and actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {currentPath && (
            <Button variant="ghost" size="sm" onClick={handleBackClick}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {getBreadcrumbs().map((crumb, index) => (
              <span key={index}>
                {index > 0 && " / "}
                {crumb}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCreateFolderDialogOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-1" />
            New Folder
          </Button>
          <Button variant="outline" size="sm" onClick={() => setUploadModalOpen(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No files found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {type === "all" ? "Upload some files or create a folder to get started" : `No ${type} files found`}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCreateFolderDialogOpen(true)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Folder
            </Button>
            <Button variant="outline" onClick={() => setUploadModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <Card
              key={file.id}
              className="overflow-hidden cursor-pointer hover:shadow-md hover:bg-muted/30 transition-all duration-200"
              onClick={() => handleFileClick(file)}
            >
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="pointer-events-none">{getFileIcon(file.type)}</div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="-mr-2 -mt-2 hover:bg-muted/60"
                          disabled={loadingStates[file.id]}
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                          }}
                        >
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
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFileAction("download", file)
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download {file.isFolder ? "as ZIP" : ""}
                        </DropdownMenuItem>
                        {!file.isFolder && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleFileAction("share", file)
                            }}
                          >
                            Share
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFileAction("rename", file)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFileAction("details", file)
                          }}
                        >
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFileAction("delete", file)
                          }}
                          className="text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-4 pointer-events-none">
                    <h3 className="font-medium truncate" title={file.displayName}>
                      {file.name}
                    </h3>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {file.isFolder ? <p>Folder</p> : <p>{formatSize(file.size)}</p>}
                      <p>Modified {formatDate(file.modified)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedFile?.isFolder ? "folder" : "file"}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedFile?.displayName}"? This action cannot be undone.
              {selectedFile?.isFolder && " All files in this folder will need to be moved or deleted separately."}
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
            <DialogTitle>Rename {selectedFile?.isFolder ? "folder" : "file"}</DialogTitle>
            <DialogDescription>
              Enter a new name for "{selectedFile?.displayName}".
              {!selectedFile?.isFolder && " The file extension will be preserved."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRenameSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="filename">Name</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="filename"
                    value={selectedFile?.isFolder ? newFileName : getFileNameWithoutExtension(newFileName)}
                    onChange={(e) => {
                      if (selectedFile?.isFolder) {
                        setNewFileName(e.target.value)
                      } else {
                        const extension = getFileExtension(selectedFile?.displayName || "")
                        if (e.target.value.trim()) {
                          setNewFileName(e.target.value + extension)
                        } else {
                          setNewFileName("")
                        }
                      }
                    }}
                    placeholder={selectedFile?.isFolder ? "Enter folder name" : "Enter file name"}
                    disabled={renameLoading}
                    className="flex-1"
                  />
                  {!selectedFile?.isFolder && getFileExtension(selectedFile?.displayName || "") && (
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

      {/* Create Folder Dialog */}
      <Dialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Enter a name for the new folder.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFolderSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="foldername">Folder name</Label>
                <Input
                  id="foldername"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className="flex-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateFolderDialogOpen(false)
                  setNewFolderName("")
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!newFolderName.trim()}>
                Create Folder
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadComplete={() => {
          fetchFiles()
          if (onRefresh) onRefresh()
        }}
        currentPath={currentPath}
      />

      {selectedFile && (
        <>
          <ShareModal open={shareOpen} onOpenChange={setShareOpen} file={selectedFile} />
          <FileDetailsModal open={detailsOpen} onOpenChange={setDetailsOpen} file={selectedFile} />
        </>
      )}
    </>
  )
}
