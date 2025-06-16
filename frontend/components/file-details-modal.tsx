"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  FileIcon,
  FileTextIcon,
  FolderIcon,
  ImageIcon,
  FileArchiveIcon,
  FileAudioIcon,
  FileVideoIcon,
  Calendar,
  User,
  HardDrive,
  Clock,
  Link,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface FileDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: any
}

export function FileDetailsModal({ open, onOpenChange, file }: FileDetailsModalProps) {
  if (!file) return null

  const formatSize = (bytes: number | null) => {
    if (bytes === null) return "N/A"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "folder":
        return <FolderIcon className="h-12 w-12 text-blue-500" />
      case "image":
        return <ImageIcon className="h-12 w-12 text-green-500" />
      case "pdf":
      case "document":
        return <FileTextIcon className="h-12 w-12 text-red-500" />
      case "archive":
        return <FileArchiveIcon className="h-12 w-12 text-yellow-500" />
      case "audio":
        return <FileAudioIcon className="h-12 w-12 text-purple-500" />
      case "video":
        return <FileVideoIcon className="h-12 w-12 text-pink-500" />
      default:
        return <FileIcon className="h-12 w-12 text-gray-500" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>File Details</DialogTitle>
          <DialogDescription>Information about "{file.name}"</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-start gap-4">
            {getFileIcon(file.type)}
            <div>
              <h3 className="font-medium">{file.name}</h3>
              <p className="text-sm text-muted-foreground">{file.type.charAt(0).toUpperCase() + file.type.slice(1)}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Created:</span>
              <span className="text-sm text-muted-foreground">{formatDate(file.modified)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Modified:</span>
              <span className="text-sm text-muted-foreground">{formatDate(file.modified)}</span>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Owner:</span>
              <span className="text-sm text-muted-foreground">{file.owner}</span>
            </div>

            {file.type !== "folder" && (
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Size:</span>
                <span className="text-sm text-muted-foreground">{formatSize(file.size)}</span>
              </div>
            )}

            {file.type === "folder" && (
              <div className="flex items-center gap-2">
                <FileIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Items:</span>
                <span className="text-sm text-muted-foreground">{file.items}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Link className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Location:</span>
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                /My Files/{file.type === "folder" ? file.name : ""}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
