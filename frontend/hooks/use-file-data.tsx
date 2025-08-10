"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "@/hooks/use-toast"

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

interface UseFileDataProps {
  type?: "all" | "shared" | "recent" | "trash"
  makeAuthenticatedRequest: (url: string, options?: RequestInit) => Promise<Response>
}

export function useFileData({ type = "all", makeAuthenticatedRequest }: UseFileDataProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [virtualFolders, setVirtualFolders] = useState<string[]>([])
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  // Load virtual folders from localStorage
  useEffect(() => {
    const savedFolders = localStorage.getItem("virtualFolders")
    if (savedFolders) {
      setVirtualFolders(JSON.parse(savedFolders))
    }
  }, [])

  const saveVirtualFolders = useCallback((folders: string[]) => {
    setVirtualFolders(folders)
    localStorage.setItem("virtualFolders", JSON.stringify(folders))
  }, [])

  const getActualFileName = useCallback((displayName: string): string => {
    if (!displayName) return "Unknown File"
    const pathParts = displayName.split("/")
    const fileName = pathParts[pathParts.length - 1]
    const timestampPattern = /^\d{13}-(.+)$/
    const match = fileName.match(timestampPattern)
    return match ? match[1] : fileName
  }, [])

  const getFileTypeFromName = useCallback((fileName: string): string => {
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
  }, [])

  const fetchFiles = useCallback(
    async (force = false) => {
      // Prevent multiple rapid fetches (debounce for 1 second)
      const now = Date.now()
      if (!force && now - lastFetchTime < 1000) {
        return
      }

      setLoading(true)
      setLastFetchTime(now)

      try {
        const response = await makeAuthenticatedRequest("http://localhost:8080/file/list", {
          method: "GET",
        })

        if (response.ok) {
          const data = await response.json()

          const transformedFiles = data.map((file: any, index: number) => {
            const displayName = file.displayName || file.display_name || "Unknown File"
            const s3Key = file.key || ""
            const actualFileName = getActualFileName(displayName)
            const fileType = getFileTypeFromName(actualFileName)
            const pathParts = displayName.split("/")
            pathParts.pop()
            const filePath = pathParts.join("/")

            return {
              id: `file-${index}`,
              name: actualFileName,
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
        } else {
          throw new Error(`Failed to fetch files: ${response.status}`)
        }
      } catch (error: any) {
        console.error("Error fetching files:", error)
        toast({
          variant: "destructive",
          title: "Failed to load files",
          description: error.message || "Could not load files from server",
        })
        setFiles([])
      } finally {
        setLoading(false)
      }
    },
    [makeAuthenticatedRequest, virtualFolders, getActualFileName, getFileTypeFromName, lastFetchTime],
  )

  // Auto-fetch when dependencies change
  useEffect(() => {
    fetchFiles()
  }, [type, virtualFolders])

  const getFilteredFiles = useCallback(
    (currentPath: string) => {
      return files.filter((file) => {
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
    },
    [files, type],
  )

  const getFilesInFolder = useCallback(
    (folderPath: string) => {
      return files.filter((file) => {
        if (file.isFolder) return false
        return file.displayName.startsWith(folderPath + "/")
      })
    },
    [files],
  )

  const refreshFiles = useCallback(() => {
    fetchFiles(true)
  }, [fetchFiles])

  return {
    files,
    loading,
    virtualFolders,
    saveVirtualFolders,
    getFilteredFiles,
    getFilesInFolder,
    refreshFiles,
  }
}
