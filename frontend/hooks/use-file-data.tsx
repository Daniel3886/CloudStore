"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { toast } from "@/hooks/use-toast"
import { FileItem } from "@/lib/file"

interface UseFileDataProps {
  type?: "all" | "shared" | "recent" | "trash"
  makeAuthenticatedRequest: (url: string, options?: RequestInit) => Promise<Response>
}

export function useFileData({ type = "all", makeAuthenticatedRequest }: UseFileDataProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [initialLoading, setInitialLoading] = useState(true) 
  const [backgroundLoading, setBackgroundLoading] = useState(false) 

  const [virtualFolders, setVirtualFolders] = useState<string[]>([])
  const cacheRef = useRef<Record<string, FileItem[]>>({})
  const fetchTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("virtualFolders")
    setVirtualFolders(saved ? JSON.parse(saved) : [])
  }, [])

  const saveVirtualFolders = useCallback((folders: string[]) => {
    setVirtualFolders(folders)
    localStorage.setItem("virtualFolders", JSON.stringify(folders))
  }, [])

  const getActualFileName = useCallback((displayName: string): string => {
    if (!displayName) return "Unknown File"
    const fileName = displayName.split("/").pop() || displayName
    const match = fileName.match(/^\d{13}-(.+)$/)
    return match ? match[1] : fileName
  }, [])

  const getFileTypeFromName = useCallback((fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    if (!extension) return "file"

    const extGroups: Record<string, string[]> = {
      image: ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"],
      document: ["doc", "docx", "txt", "rtf", "odt"],
      video: ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"],
      audio: ["mp3", "wav", "flac", "aac", "ogg", "wma"],
      archive: ["zip", "rar", "7z", "tar", "gz", "bz2"],
    }

    if (extension === "pdf") return "pdf"
    for (const [, exts] of Object.entries(extGroups)) {
      if (exts.includes(extension)) return Object.keys(extGroups).find(k => extGroups[k].includes(extension)) || "file"
    }
    return "file"
  }, [])

  const buildFolderItems = useCallback((folderPaths: string[]): FileItem[] => {
    const base = Date.now()
    return folderPaths.map((folderPath, index) => {
      const parts = folderPath.split("/")
      const folderName = parts.pop() || folderPath
      const parentPath = parts.join("/")

      return {
        id: -(base + index),
        name: folderName,
        s3Key: "",
        displayName: folderName,
        type: "folder",
        size: undefined, 
        modified: String(Date.now()),
        owner: "You",
        path: parentPath,
        isFolder: true,
      } as FileItem
    })
  }, [])

  const fetchFiles = useCallback(
    async (force = false, isBackground = false) => {
      if (!force && cacheRef.current[type]) {
        setFiles(cacheRef.current[type])
        setInitialLoading(false)
        return
      }

      if (isBackground) {
        setBackgroundLoading(true)
      } else {
        setInitialLoading(true)
      }

      try {
        const endpoint = type === "trash" ? "http://localhost:8080/file/trash" : "http://localhost:8080/file/list"
        const response = await makeAuthenticatedRequest(endpoint, { method: "GET" })

        if (!response.ok) {
          if (response.status === 404) {
            const folderItems = type !== "trash" ? buildFolderItems(virtualFolders) : []
            cacheRef.current[type] = folderItems
            setFiles(folderItems)
            return
          }
          const errText = await response.text().catch(() => "")
          throw new Error(errText || `Failed to fetch files: ${response.status}`)
        }

        const data = await response.json().catch(() => null)
        if (!Array.isArray(data)) {
          const folderItems = type !== "trash" ? buildFolderItems(virtualFolders) : []
          cacheRef.current[type] = folderItems
          setFiles(folderItems)
          return
        }

        const transformedFiles: FileItem[] = data.map((file: any) => {
          const rawId = file.id ?? file.fileId
          let parsedId: number
          if (typeof rawId === "number") {
            parsedId = rawId
          } else if (rawId != null) {
            const n = Number(rawId)
            parsedId = Number.isFinite(n) ? n : Date.now()
          } else {
            parsedId = Date.now()
          }

          let parsedSize: number | undefined = undefined
          if (file.size != null) {
            const s = typeof file.size === "number" ? file.size : Number(file.size)
            parsedSize = Number.isFinite(s) ? s : undefined
          }

          let parsedModified = Date.now()
          if (file.lastModified != null) {
            if (typeof file.lastModified === "number") {
              parsedModified = file.lastModified
            } else {
              const parsed = Date.parse(String(file.lastModified))
              if (!isNaN(parsed)) parsedModified = parsed
            }
          }

          const displayName = file.displayName || file.display_name || "Unknown File"
          const s3Key = file.key || file.s3Key || ""
          const actualFileName = getActualFileName(displayName)
          const fileType = getFileTypeFromName(actualFileName)
          const filePath = String(displayName).split("/").slice(0, -1).join("/")

          return {
            id: parsedId,
            name: actualFileName,
            s3Key,
            displayName,
            type: fileType,
            size: parsedSize,
            modified: String(parsedModified),
            owner: file.sharedBy || "You",
            path: filePath,
            isFolder: false,
          } as FileItem
        })

        const folderItems: FileItem[] = type !== "trash" ? buildFolderItems(virtualFolders) : []
        const allFiles = [...folderItems, ...transformedFiles]

        cacheRef.current[type] = allFiles
        setFiles(allFiles)
      } catch (error: any) {
        console.error("Error fetching files:", error)
        if (!isBackground) {
          toast({
            variant: "destructive",
            title: "Failed to load files",
            description: error?.message || "Could not load files from server",
          })
        }
        if (!cacheRef.current[type]) {
          const folderItems = type !== "trash" ? buildFolderItems(virtualFolders) : []
          cacheRef.current[type] = folderItems
          setFiles(folderItems)
        }
      } finally {
        if (isBackground) {
          setBackgroundLoading(false)
        } else {
          setInitialLoading(false)
        }
      }
    },
    [makeAuthenticatedRequest, getActualFileName, getFileTypeFromName, type, virtualFolders, buildFolderItems],
  )

  useEffect(() => {
    fetchFiles()
  }, [type]) 

  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
      fetchTimeoutRef.current = null
    }
    fetchTimeoutRef.current = window.setTimeout(() => {
      fetchFiles(true, true) 
    }, 500)

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
        fetchTimeoutRef.current = null
      }
    }
  }, [virtualFolders]) 

  const addFolder = useCallback(
    (folderPath: string) => {
      const parts = folderPath.split("/")
      const folderName = parts.pop() || folderPath
      const parentPath = parts.join("/")

      const newFolder: FileItem = {
        id: -Date.now(),
        name: folderName,
        s3Key: "",
        displayName: folderName,
        type: "folder",
        size: undefined,
        modified: String(Date.now()),
        owner: "You",
        path: parentPath,
        isFolder: true,
      }

      setFiles(prev => {
        const next = [...prev, newFolder]
        cacheRef.current[type] = next
        return next
      })

      fetchFiles(true, true)
    },
    [fetchFiles, type],
  )

  const getFilteredFiles = useCallback(
    (currentPath: string) => {
      return files.filter((file) => {
        let typeMatch = true
        if (type === "shared") typeMatch = file.owner !== "You"
        if (type === "recent") {
          const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
          const modifiedDate = Number(file.modified ?? 0)
          typeMatch = modifiedDate > oneWeekAgo
        }
        return typeMatch && file.path === currentPath
      })
    },
    [files, type],
  )

  const getFilesInFolder = useCallback(
    (folderPath: string) =>
      files.filter((file) => !file.isFolder && (file.displayName ?? "").startsWith(folderPath + "/")),
    [files],
  )

  const refreshFiles = useCallback(() => {
    fetchFiles(true, false) 
  }, [fetchFiles])

  return {
    files,
    initialLoading,
    backgroundLoading,
    virtualFolders,
    saveVirtualFolders,
    addFolder,
    getFilteredFiles,
    getFilesInFolder,
    refreshFiles,
  }
}