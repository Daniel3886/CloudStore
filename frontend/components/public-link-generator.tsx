"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Link, Copy, Eye, Download, Clock, Globe, Loader2 } from "lucide-react"
import { PublicFileSharingAPI, type PublicLinkResponse } from "@/lib/public-file-sharing"

interface PublicLinkGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: {
    id: number | string 
    name: string
    displayName?: string
    size?: number
  }
}

export function PublicLinkGenerator({ open, onOpenChange, file }: PublicLinkGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [publicLinks, setPublicLinks] = useState<PublicLinkResponse | null>(null)

  const handleGenerateLink = async () => {
  try {
    const response = await PublicFileSharingAPI.generatePublicLink(file.id)
    setPublicLinks(response)
  } catch (error: any) {
    console.error("Failed to generate link:", error)
    toast({
      variant: "destructive",
      title: "Failed to generate link",
      description: error.message || "Could not generate public link",
    })
  }
}


  const handleCopyLink = (link: string, type: string) => {
    navigator.clipboard.writeText(link)
    toast({
      title: "Link copied",
      description: `${type} link copied to clipboard`,
    })
  }

  const handleOpenLink = (link: string) => {
    window.open(link, "_blank")
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Generate Public Link
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Link className="h-4 w-4" />
                {file.displayName || file.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Size: {formatFileSize(file.size)}</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  24h expiry
                </Badge>
              </div>
            </CardContent>
          </Card>

          {!publicLinks ? (
            <div className="space-y-4">
              <div className="text-center py-6">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Create Public Link</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate a public link that allows anyone to access this file for 24 hours.
                </p>
                <Button onClick={handleGenerateLink} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Generate Public Link
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium mb-2">Public Link Generated!</h3>
                <p className="text-sm text-muted-foreground">
                  Your file is now publicly accessible. Links expire in 24 hours.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Link
                </Label>
                <div className="flex gap-2">
                  <Input value={publicLinks.downloadLink} readOnly className="font-mono text-xs" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyLink(publicLinks.downloadLink, "Download")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleOpenLink(publicLinks.downloadLink)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {publicLinks.previewLink && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview Link
                  </Label>
                  <div className="flex gap-2">
                    <Input value={publicLinks.previewLink} readOnly className="font-mono text-xs" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyLink(publicLinks.previewLink!, "Preview")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleOpenLink(publicLinks.previewLink!)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {publicLinks.message && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-800">{publicLinks.message}</p>
                </div>
              )}

              <Button variant="outline" onClick={() => setPublicLinks(null)} className="w-full">
                Generate Another Link
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
