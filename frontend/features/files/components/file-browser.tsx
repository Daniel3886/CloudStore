"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ShareModal } from "@/features/sharing/components/share-modal"
import { DeleteFileDialog } from "@/features/files/components/delete-file-dialog"
import { FileBrowserEmptyState, FileBrowserLoading } from "@/features/files/components/file-browser-states"
import { FileDetailsModal } from "@/features/files/components/file-details-modal"
import { FileGrid } from "@/features/files/components/file-grid"
import { FileList } from "@/features/files/components/file-list"
import { FileViewToggle } from "@/features/files/components/file-view-toggle"
import { FolderNavigation } from "@/features/files/components/folder-navigation"
import { RenameDialog } from "@/features/files/components/rename-dialog"
import { useFileData } from "@/features/files/hooks/use-file-data"
import { useFileOperations } from "@/features/files/hooks/use-file-operations"
import { useFileViewMode } from "@/features/files/hooks/use-file-view-mode"
import {
  DEFAULT_SORT,
  countFolderChildren,
  sortFiles,
  toggleSort,
  type FileSort,
  type SortKey,
} from "@/features/files/lib/sort-files"
import { usePublicLinkStatus } from "@/features/public-links/hooks/use-public-link-status"
import { filterFilesForView, getFilesInFolder, getItemPath } from "@/features/files/lib/file-filters"
import { joinPath, splitPath } from "@/features/files/lib/file-utils"
import { removeFolderTree, renameFolderTree } from "@/features/files/lib/virtual-folders"
import type { FileAction, FileItem, FileView } from "@/features/files/types"

type OpenDialog = "share" | "details" | "delete" | "permanent-delete" | "rename" | null

interface FileBrowserProps {
  type?: FileView
  searchQuery?: string
  currentPath?: string
  onCurrentPathChange?: (path: string) => void
  refreshSignal?: number
}

export function FileBrowser({
  type = "all",
  searchQuery = "",
  currentPath = "",
  onCurrentPathChange,
  refreshSignal = 0,
}: FileBrowserProps) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [viewMode, setViewMode] = useFileViewMode()
  const [sort, setSort] = useState<FileSort>(() =>
    type === "trash" ? { key: "purgeAt", direction: "asc" } : DEFAULT_SORT,
  )
  const [linkSignal, setLinkSignal] = useState(0)

  const operations = useFileOperations()
  const { files, loading, virtualFolders, saveVirtualFolders, refreshFiles } = useFileData(type)
  const handledRefreshSignal = useRef(refreshSignal)

  useEffect(() => {
    if (refreshSignal === handledRefreshSignal.current) return
    handledRefreshSignal.current = refreshSignal
    void refreshFiles()
  }, [refreshSignal, refreshFiles])

  const isTrashView = type === "trash"
  const publicLinks = usePublicLinkStatus(!isTrashView, refreshSignal + linkSignal)
  const folderCounts = useMemo(() => countFolderChildren(files), [files])
  const visibleFiles = useMemo(
    () => sortFiles(filterFilesForView(files, { view: type, currentPath, searchQuery }), sort),
    [files, type, currentPath, searchQuery, sort],
  )
  const handleSortChange = (key: SortKey) => setSort((current) => toggleSort(current, key))

  const dialogProps = (name: Exclude<OpenDialog, null>) => ({
    open: openDialog === name,
    onOpenChange: (isOpen: boolean) => {
      setOpenDialog(isOpen ? name : null)
      // Sharing can create or revoke a public link, so refresh the badges when it closes.
      if (!isOpen && (name === "share" || name === "details")) setLinkSignal((n) => n + 1)
    },
  })

  const handleFileAction = async (action: FileAction, file: FileItem) => {
    setSelectedFile(file)
    switch (action) {
      case "download":
        if (file.isFolder) await operations.downloadFolder(file, getFilesInFolder(files, getItemPath(file)))
        else await operations.downloadFile(file)
        break
      case "restore":
        if (await operations.restoreFile(file)) await refreshFiles()
        break
      default:
        setOpenDialog(action)
    }
  }

  const handleFileClick = (file: FileItem) => {
    if (!isTrashView && file.isFolder) onCurrentPathChange?.(getItemPath(file))
  }

  const handleDeleteConfirm = async () => {
    if (!selectedFile) return
    if (!(await operations.deleteFile(selectedFile))) return
    if (selectedFile.isFolder) saveVirtualFolders(removeFolderTree(virtualFolders, getItemPath(selectedFile)))
    await refreshFiles()
  }

  const handlePermanentDeleteConfirm = async () => {
    if (!selectedFile) return
    if (await operations.permanentlyDeleteFile(selectedFile)) await refreshFiles()
  }

  const handleRename = async (file: FileItem, newName: string): Promise<string | null> => {
    const error = await operations.renameFile(file, newName)
    if (error || newName === file.name) return error
    if (file.isFolder) {
      saveVirtualFolders(renameFolderTree(virtualFolders, getItemPath(file), joinPath(file.path, newName)))
    }
    await refreshFiles()
    return null
  }

  if (loading) return <FileBrowserLoading />

  return (
    <>
      <div className="mb-4 flex min-h-9 flex-wrap items-center justify-between gap-2">
        {currentPath && !isTrashView ? (
          <FolderNavigation
            currentPath={currentPath}
            onBack={() => onCurrentPathChange?.(splitPath(currentPath).parent)}
          />
        ) : (
          <span />
        )}
        {visibleFiles.length > 0 && <FileViewToggle mode={viewMode} onModeChange={setViewMode} />}
      </div>

      {visibleFiles.length === 0 ? (
        <FileBrowserEmptyState view={type} />
      ) : viewMode === "list" ? (
        <FileList
          files={visibleFiles}
          sort={sort}
          onSortChange={handleSortChange}
          loadingStates={operations.loadingStates}
          isTrashView={isTrashView}
          folderCounts={folderCounts}
          publicLinks={publicLinks}
          onFileClick={handleFileClick}
          onFileAction={handleFileAction}
        />
      ) : (
        <FileGrid
          files={visibleFiles}
          loadingStates={operations.loadingStates}
          isTrashView={isTrashView}
          folderCounts={folderCounts}
          publicLinks={publicLinks}
          onFileClick={handleFileClick}
          onFileAction={handleFileAction}
        />
      )}

      <DeleteFileDialog
        {...dialogProps("delete")}
        file={selectedFile}
        permanent={false}
        onConfirm={handleDeleteConfirm}
      />
      <DeleteFileDialog
        {...dialogProps("permanent-delete")}
        file={selectedFile}
        permanent
        onConfirm={handlePermanentDeleteConfirm}
      />
      <RenameDialog
        {...dialogProps("rename")}
        file={selectedFile}
        onRename={handleRename}
        isLoading={selectedFile ? (operations.loadingStates[selectedFile.id] ?? false) : false}
      />

      {selectedFile && (
        <>
          <ShareModal {...dialogProps("share")} file={selectedFile} />
          <FileDetailsModal {...dialogProps("details")} file={selectedFile} onDownload={operations.downloadFile} />
        </>
      )}
    </>
  )
}
