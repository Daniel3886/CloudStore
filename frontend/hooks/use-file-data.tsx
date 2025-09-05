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

  const cacheRef = useRef<Record<string, FileItem[]>>({})
  const fetchTimeoutRef = useRef<number | null>(null)

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

      if (isBackground) setBackgroundLoading(true)
      else setInitialLoading(true)

      try {
        const endpoint = type === "trash" ? "http://localhost:8080/file/trash" : "http://localhost:8080/file/list"
        const response = await makeAuthenticatedRequest(endpoint, { method: "GET" })

        if (!response.ok) {
          const errText = await response.text().catch(() => "")
          throw new Error(errText || `Failed to fetch files: ${response.status}`)
        }

        const data = await response.json().catch(() => [])
        const transformedFiles: FileItem[] = (Array.isArray(data) ? data : []).map((file: any) => {
          const rawId = file.id ?? file.fileId
          const parsedId = typeof rawId === "number" ? rawId : Number(rawId) || Date.now()
          const parsedSize = Number(file.size) || undefined
          const parsedModified = !isNaN(Date.parse(file.lastModified)) ? Date.parse(file.lastModified) : Date.now()
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

        cacheRef.current[type] = transformedFiles
        setFiles(transformedFiles)
      } catch (error: any) {
        console.error("Error fetching files:", error)
        toast({
          variant: "destructive",
          title: "Failed to load files",
          description: error?.message || "Could not load files from server",
        })
        if (!cacheRef.current[type]) setFiles([])
      } finally {
        if (isBackground) setBackgroundLoading(false)
        else setInitialLoading(false)
      }
    },
    [makeAuthenticatedRequest, getActualFileName, getFileTypeFromName, type],
  )

  useEffect(() => {
    fetchFiles()
  }, [type])

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
    (currentPath: string) => files.filter(file => {
      let typeMatch = true
      if (type === "shared") typeMatch = file.owner !== "You"
      if (type === "recent") {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        typeMatch = Number(file.modified ?? 0) > oneWeekAgo
      }
      return typeMatch && file.path === currentPath
    }),
    [files, type],
  )

  const getFilesInFolder = useCallback(
    (folderPath: string) => files.filter(file => !file.isFolder && (file.displayName ?? "").startsWith(folderPath + "/")),
    [files],
  )

  const refreshFiles = useCallback(() => fetchFiles(true, false), [fetchFiles])

  return {
    files,
    initialLoading,
    backgroundLoading,
    addFolder,
    getFilteredFiles,
    getFilesInFolder,
    refreshFiles,
  }
}
