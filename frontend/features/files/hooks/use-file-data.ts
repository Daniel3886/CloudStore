"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "@/hooks/use-toast"
import { ApiError, getErrorMessage } from "@/lib/api/client"
import { filesApi, type FileResponse } from "@/features/files/api"
import { buildFolderItems, mapFileResponses } from "@/features/files/lib/map-file"
import { getVirtualFolders, setVirtualFolders } from "@/features/files/lib/virtual-folders"
import type { FileItem, FileView } from "@/features/files/types"

async function fetchFileList(view: FileView): Promise<FileResponse[]> {
  try {
    const data = view === "trash" ? await filesApi.listTrash() : await filesApi.list()
    return Array.isArray(data) ? data : []
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return []
    throw error
  }
}

export function useFileData(view: FileView = "all") {
  const t = useTranslations("files")
  const [remoteFiles, setRemoteFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [virtualFolders, setVirtualFoldersState] = useState<string[]>([])
  const requestIdRef = useRef(0)

  const loadFiles = useCallback(
    async (isCancelled: () => boolean = () => false) => {
      const requestId = ++requestIdRef.current
      const isStale = () => isCancelled() || requestId !== requestIdRef.current
      try {
        const data = await fetchFileList(view)
        if (isStale()) return
        setRemoteFiles(mapFileResponses(data, t("unknownFile")))
      } catch (error) {
        if (isStale()) return
        toast({
          variant: "destructive",
          title: t("toasts.loadFailed.title"),
          description: getErrorMessage(error, t("toasts.loadFailed.description")),
        })
      } finally {
        if (!isStale()) setLoading(false)
      }
    },
    [view, t],
  )

  useEffect(() => {
    setVirtualFoldersState(getVirtualFolders())
  }, [])

  useEffect(() => {
    let cancelled = false
    void loadFiles(() => cancelled)
    return () => {
      cancelled = true
    }
  }, [loadFiles])

  const saveVirtualFolders = useCallback((folders: string[]) => {
    setVirtualFoldersState(folders)
    setVirtualFolders(folders)
  }, [])

  const refreshFiles = useCallback(() => loadFiles(), [loadFiles])

  const files = useMemo(
    () => (view === "trash" ? remoteFiles : [...buildFolderItems(virtualFolders), ...remoteFiles]),
    [view, remoteFiles, virtualFolders],
  )

  return {
    files,
    loading,
    virtualFolders,
    saveVirtualFolders,
    refreshFiles,
  }
}
