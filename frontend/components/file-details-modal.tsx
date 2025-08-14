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
import { FileIcon, Calendar, HardDrive, User, Share2, Download, Trash2, Edit3, Copy } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { formatDate, formatFileSize } from "@/lib/file-utils"
import { ShareModal } from "./share-modal"
import { FileSharingManagement } from "./file-sharing-management"

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

  if (!file) return null

  const handleCopyLink = () => {
    const link = `${window.location.origin}/files/${file.s3Key || file.id}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Link copied",
      description: "File link copied to clipboard",
    })
  }

  const handleShare = () => {
    setShareModalOpen(true)
  }

  const handleManageSharing = () => {
    setManagementModalOpen(true)
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

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              <Button variant="outline" size="sm" onClick={handleManageSharing}>
                <User className="h-4 w-4 mr-2" />
                Manage
              </Button>

              {onDownload && (
                <Button variant="outline" size="sm" onClick={() => onDownload(file)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
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
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
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
    </>
  )
}
