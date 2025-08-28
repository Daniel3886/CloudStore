"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { FileItem } from "@/lib/file"

interface UseFileDataProps {
  type?: "all" | "shared" | "recent" | "trash"
  makeAuthenticatedRequest: (url: string, options?: RequestInit) => Promise<Response>
}

export function useFileData({ type = "all", makeAuthenticatedRequest }: UseFileDataProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [virtualFolders, setVirtualFolders] = useState<string[]>([])
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  useEffect(() => {
    const loadVirtualFolders = () => {
      const savedFolders = localStorage.getItem("virtualFolders")
      if (savedFolders) {
        const parsed = JSON.parse(savedFolders)
        setVirtualFolders(parsed)
      } else {
        setVirtualFolders([])
      }
    }

    loadVirtualFolders()
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
      const now = Date.now()
      if (!force && now - lastFetchTime < 1000) {
        return
      }

      setLoading(true)
      setLastFetchTime(now)

      try {
        const savedFolders = localStorage.getItem("virtualFolders")
        const currentVirtualFolders = savedFolders ? JSON.parse(savedFolders) : []
        
        let endpoint = "http://localhost:8080/file/list"

        if (type === "trash") {
          endpoint = "http://localhost:8080/file/trash"
        }

        const response = await makeAuthenticatedRequest(endpoint, {
          method: "GET",
        })

        if (response.ok) {
          const data = await response.json()

          if (!data || !Array.isArray(data)) {
            let folderItems: any[] = []
            if (type !== "trash") {
              folderItems = currentVirtualFolders.map((folderPath: string, index: number) => {
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
            }
            setFiles(folderItems)
            return
          }

          if (data.length === 0) {
            let folderItems: any[] = []
            if (type !== "trash") {
              folderItems = currentVirtualFolders.map((folderPath: string, index: number) => {
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
            }
            setFiles(folderItems)
            return
          }

          const transformedFiles = data.map((file: any, index: number) => {
            const displayName = file.displayName || file.display_name || "Unknown File"
            const s3Key = file.key || file.s3Key || ""
            const actualFileName = getActualFileName(displayName)
            const fileType = getFileTypeFromName(actualFileName)
            const pathParts = displayName.split("/")
            pathParts.pop()
            const filePath = pathParts.join("/")

            return {
              id: file.id ?? file.fileId,
              name: actualFileName,
              s3Key: s3Key,
              displayName: displayName,
              type: fileType,
              size: file.size || null,
              modified: file.lastModified || new Date().toISOString(),
              owner: file.sharedBy || "You", 
              path: filePath,
              isFolder: false,
            }
          })

          let folderItems: any[] = []
          if (type !== "trash") {
            folderItems = currentVirtualFolders.map((folderPath: string, index: number) => {
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
          }

          const allFiles = [...folderItems, ...transformedFiles]
          setFiles(allFiles)
          
          if (JSON.stringify(currentVirtualFolders) !== JSON.stringify(virtualFolders)) {
            setVirtualFolders(currentVirtualFolders)
          }
        } else {
          if (response.status === 404) {
            let folderItems: any[] = []
            if (type !== "trash") {
              const savedFolders = localStorage.getItem("virtualFolders")
              const currentVirtualFolders = savedFolders ? JSON.parse(savedFolders) : []
              
              folderItems = currentVirtualFolders.map((folderPath: string, index: number) => {
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
            }
            setFiles(folderItems)
            return
          }

          const errorText = await response.text()
          throw new Error(errorText || `Failed to fetch files: ${response.status}`)
        }
      } catch (error: any) {
        console.error("Error fetching files:", error)

        if (error.message && !error.message.includes("404")) {
          toast({
            variant: "destructive",
            title: "Failed to load files",
            description: error.message || "Could not load files from server",
          })
        }

        let folderItems: any[] = []
        if (type !== "trash") {
          const savedFolders = localStorage.getItem("virtualFolders")
          const currentVirtualFolders = savedFolders ? JSON.parse(savedFolders) : []
          
          folderItems = currentVirtualFolders.map((folderPath: string, index: number) => {
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
        }
        setFiles(folderItems)
      } finally {
        setLoading(false)
      }
    },
    [makeAuthenticatedRequest, getActualFileName, getFileTypeFromName, lastFetchTime, type, virtualFolders],
  )

  useEffect(() => {
    fetchFiles()
  }, [type]) 

  useEffect(() => {
    if (virtualFolders.length > 0 || localStorage.getItem("virtualFolders")) {
      fetchFiles(true)
    }
  }, [virtualFolders])

  const getFilteredFiles = useCallback(
    (currentPath: string) => {
      
      const filtered = files.filter((file) => {
        let typeMatch = true
        if (type === "shared") typeMatch = file.owner !== "You"
        if (type === "recent") {
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
          const modifiedDate = file.modified ? new Date(file.modified) : new Date(0)
          typeMatch = modifiedDate > oneWeekAgo
        }

        const pathMatch = file.path === currentPath
        return typeMatch && pathMatch
      })
      
      return filtered
    },
    [files, type],
  )

  const getFilesInFolder = useCallback(
    (folderPath: string) => {
      return files.filter((file) => {
        if (file.isFolder) return false
        return (file.displayName ?? "").startsWith(folderPath + "/")
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