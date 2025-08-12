"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { RefreshCw, ArrowLeft, FileIcon } from "lucide-react"
import { ShareModal } from "./share-modal"
import { FileDetailsModal } from "./file-details-modal"
import { FileCard } from "./file-browser/file-card"
import { RenameDialog } from "./file-browser/rename-dialog"
import { useFileOperations } from "@/hooks/use-file-operations"
import { useFileData } from "@/hooks/use-file-data"
import { getBreadcrumbs } from "@/utils/file-utils"

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
  const [shareOpen, setShareOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [currentPath, setCurrentPath] = useState("")

  const {
    loadingStates,
    downloadFile,
    downloadFolder,
    deleteFile,
    renameFile,
    restoreFile,
    permanentlyDeleteFile,
    makeAuthenticatedRequest,
  } = useFileOperations()

  const { files, loading, virtualFolders, saveVirtualFolders, getFilteredFiles, getFilesInFolder, refreshFiles } =
    useFileData({
      type,
      makeAuthenticatedRequest,
    })

  const filteredFiles = getFilteredFiles(currentPath)
  const isTrashView = type === "trash"

  const handleFileAction = (action: string, file: FileItem) => {
    setSelectedFile(file)

    switch (action) {
      case "download":
        if (file.isFolder) {
          const filesInFolder = getFilesInFolder(currentPath ? `${currentPath}/${file.name}` : file.name)
          downloadFolder(file, filesInFolder)
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
      case "permanent-delete":
        setPermanentDeleteDialogOpen(true)
        break
      case "restore":
        restoreFile(file, () => {
          refreshFiles()
          if (onRefresh) {
            onRefresh()
          }
        })
        break
      case "rename":
        setRenameDialogOpen(true)
        break
      default:
        console.warn(`Action ${action} not implemented`)
    }
  }

  const handleRefresh = () => {
    refreshFiles()
    if (onRefresh) {
      onRefresh()
    }
  }

  const handleFileClick = (file: FileItem) => {
    if (isTrashView) return 

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

  const handleDeleteConfirm = () => {
    if (!selectedFile) return

    deleteFile(selectedFile, () => {
      if (selectedFile.isFolder) {
        const folderPath = currentPath ? `${currentPath}/${selectedFile.name}` : selectedFile.name
        const updatedFolders = virtualFolders.filter((folder) => !folder.startsWith(folderPath))
        saveVirtualFolders(updatedFolders)
      }
      refreshFiles()
      if (onRefresh) {
        onRefresh()
      }
      setDeleteDialogOpen(false)
      setSelectedFile(null)
    })
  }

  const handlePermanentDeleteConfirm = () => {
    if (!selectedFile) return

    permanentlyDeleteFile(selectedFile, () => {
      refreshFiles()
      if (onRefresh) {
        onRefresh()
      }
      setPermanentDeleteDialogOpen(false)
      setSelectedFile(null)
    })
  }

  const handleRename = async (file: FileItem, newName: string): Promise<string> => {
    const error = await renameFile(file, newName, currentPath, () => {
      if (file.isFolder) {
        const oldFolderPath = currentPath ? `${currentPath}/${file.name}` : file.name
        const newFolderPath = currentPath ? `${currentPath}/${newName}` : newName

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
      }
      refreshFiles()
      if (onRefresh) {
        onRefresh()
      }
    })

    return error
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
      {currentPath && !isTrashView && (
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {getBreadcrumbs(currentPath).map((crumb, index) => (
              <span key={index}>
                {index > 0 && " / "}
                {crumb}
              </span>
            ))}
          </div>
        </div>
      )}

      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{isTrashView ? "Trash is empty" : "No files found"}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isTrashView
              ? "Files you delete will appear here for 30 days before being permanently removed."
              : type === "all"
                ? "Upload some files or create a folder to get started"
                : `No ${type} files found`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              isLoading={loadingStates[file.id] || false}
              isTrashView={isTrashView}
              onFileClick={handleFileClick}
              onFileAction={handleFileAction}
            />
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move {selectedFile?.isFolder ? "folder" : "file"} to trash</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move "{selectedFile?.name}" to trash? You can restore it later from the trash.
              {selectedFile?.isFolder && " All files in this folder will also be moved to trash."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedFile(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-orange-500 hover:bg-orange-600">
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={permanentDeleteDialogOpen} onOpenChange={setPermanentDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete {selectedFile?.isFolder ? "folder" : "file"}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{selectedFile?.name}"? This action cannot be undone and the
              file will be lost forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedFile(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePermanentDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        file={selectedFile}
        onRename={handleRename}
        isLoading={loadingStates[selectedFile?.id || ""] || false}
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
