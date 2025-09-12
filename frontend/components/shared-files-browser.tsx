"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileIcon, Download, Calendar, User, MessageSquare, Loader2, Check, X, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { apiUrl } from "@/lib/config"
import { FileSharingAPI, type SharedFileDto } from "@/lib/file-sharing"
import { formatDate } from "@/lib/file-utils"

export function SharedFilesBrowser() {
  const [sharedFiles, setSharedFiles] = useState<SharedFileDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [downloadingFiles, setDownloadingFiles] = useState<Set<number>>(new Set())
  const [processingShares, setProcessingShares] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadSharedFiles()
  }, [])

  const loadSharedFiles = async () => {
    setIsLoading(true)
    try {
      const files = await FileSharingAPI.getSharedFiles()
      files.forEach((file) => {})
      setSharedFiles(files)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load shared files",
        description: error.message || "Could not load files shared with you",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptShare = async (file: SharedFileDto) => {
    if (!file.permissionId) {
      toast({
        variant: "destructive",
        title: "Failed to accept share",
        description: "Permission ID is missing. Please refresh the page and try again.",
      })
      return
    }

    setProcessingShares((prev) => new Set(prev).add(file.permissionId))

    try {
      await FileSharingAPI.acceptShare(file.permissionId)
      toast({
        title: "Share accepted",
        description: `You now have access to "${file.displayName}"`,
      })
      await loadSharedFiles()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to accept share",
        description: error.message || "Could not accept the file share",
      })
    } finally {
      setProcessingShares((prev) => {
        const newSet = new Set(prev)
        newSet.delete(file.permissionId)
        return newSet
      })
    }
  }

  const handleDeclineShare = async (file: SharedFileDto) => {
    if (!file.permissionId) {
      toast({
        variant: "destructive",
        title: "Failed to decline share",
        description: "Permission ID is missing. Please refresh the page and try again.",
      })
      return
    }

    setProcessingShares((prev) => new Set(prev).add(file.permissionId))

    try {
      await FileSharingAPI.declineShare(file.permissionId)
      toast({
        title: "Share declined",
        description: `You have declined access to "${file.displayName}"`,
      })
      await loadSharedFiles()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to decline share",
        description: error.message || "Could not decline the file share",
      })
    } finally {
      setProcessingShares((prev) => {
        const newSet = new Set(prev)
        newSet.delete(file.permissionId)
        return newSet
      })
    }
  }

  const handleDownload = async (file: SharedFileDto) => {
    setDownloadingFiles((prev) => new Set(prev).add(file.fileId))

    try {
      const response = await fetch(apiUrl(`/files/download/${encodeURIComponent(file.s3Key)}`), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error("Failed to download file")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = file.displayName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: `Downloading "${file.displayName}"`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message || "Could not download the file",
      })
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev)
        newSet.delete(file.fileId)
        return newSet
      })
    }
  }

  const getStatusBadge = (status: SharedFileDto["shareStatus"]) => {
    switch (status) {
      case "PENDING":
        return { variant: "secondary" as const, icon: Clock, text: "Pending" }
      case "ACCEPTED":
        return { variant: "default" as const, icon: Check, text: "Accepted" }
      case "DECLINED":
        return { variant: "destructive" as const, icon: X, text: "Declined" }
      default:
        return { variant: "secondary" as const, icon: Clock, text: "Unknown" }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading shared files...</p>
        </div>
      </div>
    )
  }

  if (sharedFiles.length === 0) {
    return (
      <div className="text-center py-12">
        <FileIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No shared files</h3>
        <p className="text-muted-foreground">Files shared with you will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shared with me</h2>
        <Badge variant="secondary">{sharedFiles.length} files</Badge>
      </div>

      <div className="grid gap-4">
        {sharedFiles.map((file) => {
          const statusBadge = getStatusBadge(file.shareStatus)
          const StatusIcon = statusBadge.icon
          const isProcessing = processingShares.has(file.permissionId)

          return (
            <Card key={file.fileId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{file.displayName}</CardTitle>
                      <div className="flex items-center mt-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Shared by {file.sharedBy}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-1">
                    <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {statusBadge.text}
                    </Badge>

                    {file.shareStatus === "PENDING" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcceptShare(file)}
                          disabled={isProcessing}
                          className="text-green-600 hover:text-green-700"
                        >
                          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeclineShare(file)}
                          disabled={isProcessing}
                          className="text-red-600 hover:text-red-700"
                        >
                          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                        </Button>
                      </div>
                    )}

                    {file.shareStatus === "ACCEPTED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        disabled={downloadingFiles.has(file.fileId)}
                      >
                        {downloadingFiles.has(file.fileId) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Shared {formatDate(file.sharedAt)}</span>
                  </div>

                  {file.shareStatusChangedAt && file.shareStatus !== "PENDING" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <StatusIcon className="h-4 w-4" />
                      <span>
                        {statusBadge.text} {formatDate(file.shareStatusChangedAt)}
                      </span>
                    </div>
                  )}

                  {file.message && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <MessageSquare className="h-4 w-4" />
                          <span>Message</span>
                        </div>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{file.message}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
