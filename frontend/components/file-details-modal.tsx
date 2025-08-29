"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileIcon, Calendar, HardDrive, User, Share2, Download, Trash2, Edit3, Globe, Users } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { formatDate, formatFileSize } from "@/lib/file-utils"
import { ShareModal } from "./share-modal"
import { FileSharingManagement } from "./file-sharing-management"
import { PublicLinkGenerator } from "./public-link-generator"

interface FileDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: {
    id?: string | number
    name: string
    displayName?: string
    size?: number
    uploadedAt?: string
    s3Key?: string
    owner?: string
  } | null
  onDelete?: (file: any) => void
  onRename?: (file: any) => void
  onDownload?: (file: any) => void
}

export function FileDetailsModal({ open, onOpenChange, file, onDelete, onRename, onDownload }: FileDetailsModalProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [managementModalOpen, setManagementModalOpen] = useState(false)
  const [publicLinkModalOpen, setPublicLinkModalOpen] = useState(false)

  if (!file) return null

  const handleDownload = async () => {
    if (!file.s3Key) {
      toast({
        variant: "destructive",
        title: "Cannot download",
        description: "File location not available",
      })
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/files/download/${encodeURIComponent(file.s3Key)}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to download file")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: `Downloading "${file.name}"`,
      })
    } catch (error: any) {
      console.error("Failed to download file:", error)
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message || "Could not download the file",
      })
    }
  }

  const handleShare = () => {
    setShareModalOpen(true)
  }

  const handleManageSharing = () => {
    setManagementModalOpen(true)
  }

  const handlePublicLink = () => {
    setPublicLinkModalOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileIcon className="h-5 w-5" />
              File Details
            </DialogTitle>
            <DialogDescription>View and manage file information and sharing settings.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{file.displayName || file.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {file.size && (
                  <div className="flex items-center gap-2 text-sm">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                )}

                {file.uploadedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Uploaded {formatDate(file.uploadedAt)}</span>
                  </div>
                )}

                {file.owner && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Owned by {file.owner}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Sharing Options</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>

                <Button variant="outline" size="sm" onClick={handleManageSharing}>
                  <Users className="h-4 w-4 mr-2" />
                  Manage
                </Button>

                <Button variant="outline" size="sm" onClick={handlePublicLink} className="col-span-2 bg-transparent">
                  <Globe className="h-4 w-4 mr-2" />
                  Generate Public Link
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">File Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={onDownload ? () => onDownload(file) : handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>

                {onRename && (
                  <Button variant="outline" size="sm" onClick={() => onRename(file)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Rename
                  </Button>
                )}

                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(file)}
                    className="text-red-600 hover:text-red-700 col-span-2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete File
                  </Button>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShareModal open={shareModalOpen} onOpenChange={setShareModalOpen} file={file} />

      <FileSharingManagement open={managementModalOpen} onOpenChange={setManagementModalOpen} file={file} />
      {file.id != null && (
        <PublicLinkGenerator
          open={publicLinkModalOpen}
          onOpenChange={setPublicLinkModalOpen}
          file={{
            ...file,
            id: Number(file.id),
          }}
        />
      )}
    </>
  )
}
