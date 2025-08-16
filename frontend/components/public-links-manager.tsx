"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import { toast } from "@/hooks/use-toast"
import { Globe, Copy, Eye, Download, Trash2, Clock, FileIcon, Loader2, RefreshCw } from "lucide-react"
import { PublicFileSharingAPI, type PublicFileAccessToken } from "@/lib/public-file-sharing"

interface PublicLinksManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PublicLinksManager({ open, onOpenChange }: PublicLinksManagerProps) {
  const [activeLinks, setActiveLinks] = useState<PublicFileAccessToken[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [linkToRevoke, setLinkToRevoke] = useState<PublicFileAccessToken | null>(null)

  useEffect(() => {
    if (open) {
      loadActiveLinks()
    }
  }, [open])

  const loadActiveLinks = async () => {
    setIsLoading(true)
    try {
      const links = await PublicFileSharingAPI.getActiveLinks()
      setActiveLinks(links)
    } catch (error: any) {
      console.error("Failed to load active links:", error)
      toast({
        variant: "destructive",
        title: "Failed to load links",
        description: error.message || "Could not load active public links",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = (token: string, type: "download" | "preview") => {
    const link = PublicFileSharingAPI.getPublicFileUrl(token, type === "preview")
    navigator.clipboard.writeText(link)
    toast({
      title: "Link copied",
      description: `${type === "preview" ? "Preview" : "Download"} link copied to clipboard`,
    })
  }

  const handleOpenLink = (token: string, type: "download" | "preview") => {
    const link = PublicFileSharingAPI.getPublicFileUrl(token, type === "preview")
    window.open(link, "_blank")
  }

  const handleRevokeLink = async (link: PublicFileAccessToken) => {
    try {
      await PublicFileSharingAPI.revokePublicLink(link.token)

      toast({
        title: "Link revoked",
        description: `Public access to "${link.file.displayName}" has been revoked`,
      })

      await loadActiveLinks()
    } catch (error: any) {
      console.error("Failed to revoke link:", error)
      toast({
        variant: "destructive",
        title: "Failed to revoke link",
        description: error.message || "Could not revoke public link",
      })
    } finally {
      setLinkToRevoke(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatExpiryTime = (expiresAt: string) => {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const diffMs = expiry.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffMs <= 0) {
      return "Expired"
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m remaining`
    } else {
      return `${diffMinutes}m remaining`
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) <= new Date()
  }

  const canPreview = (fileSize: number) => {
    const maxPreviewSize = 5 * 1024 * 1024
    return fileSize <= maxPreviewSize
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Manage Public Links
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {activeLinks.length} active links
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={loadActiveLinks} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            <Separator />

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : activeLinks.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No active public links</h3>
                <p className="text-muted-foreground">
                  You haven't created any public links yet. Generate one from the file details menu.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeLinks.map((link) => (
                  <Card key={link.id} className={isExpired(link.expiresAt) ? "opacity-60" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <FileIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{link.file.displayName}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>{formatFileSize(link.file.size)}</span>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span className={isExpired(link.expiresAt) ? "text-red-600" : ""}>
                                  {formatExpiryTime(link.expiresAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {canPreview(link.file.size) && !isExpired(link.expiresAt) && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyLink(link.token, "preview")}
                                title="Copy preview link"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenLink(link.token, "preview")}
                                title="Open preview"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                            </>
                          )}

                          {!isExpired(link.expiresAt) && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyLink(link.token, "download")}
                                title="Copy download link"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenLink(link.token, "download")}
                                title="Open download"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLinkToRevoke(link)}
                            className="text-red-600 hover:text-red-700"
                            title="Revoke link"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!linkToRevoke} onOpenChange={() => setLinkToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Public Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke the public link for "{linkToRevoke?.file.displayName}"? This will make the
              file inaccessible via the public link immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => linkToRevoke && handleRevokeLink(linkToRevoke)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Revoke Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
