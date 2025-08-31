"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Mail, Users, Globe, Loader2, Send } from "lucide-react"
import { FileSharingAPI, type ShareFileRequest } from "@/lib/file-sharing"
import { PublicLinksManager } from "./public-links-manager"

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: {
    id?: string | number
    name: string
    displayName?: string
  }
}

export function ShareModal({ open, onOpenChange, file }: ShareModalProps) {
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState<"VIEWER" | "EDITOR" | "MANAGER">("VIEWER")
  const [message, setMessage] = useState("")
  const [isSharing, setIsSharing] = useState(false)
  const [publicLinksOpen, setPublicLinksOpen] = useState(false)

  const handleShare = async () => {
    if (!email.trim() || !file.id) return

    setIsSharing(true)
    try {
      const fileId = Number(file.id)
      if (isNaN(fileId)) {
        toast({ variant: "destructive", title: "Invalid file ID" })
        return
      }

      const shareRequest: ShareFileRequest = {
        fileId,
        targetUserEmail: email.trim(),
        message: message.trim() || undefined,
      }

      await FileSharingAPI.shareFile(shareRequest)

      toast({
        title: "File shared successfully",
        description: `"${file.displayName || file.name}" has been shared with ${email}`,
      })

      setEmail("")
      setMessage("")
      setPermission("VIEWER")
    } catch (error: any) {
      console.error("Failed to share file:", error)
      toast({
        variant: "destructive",
        title: "Failed to share file",
        description: error.message || "Could not share the file",
      })
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Share "{file.displayName || file.name}"
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Share with specific users
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    placeholder="Enter email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSharing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Permission level</Label>
                  <Select
                    value={permission}
                    onValueChange={(value: "VIEWER" | "EDITOR" | "MANAGER") => setPermission(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEWER">Viewer - Can view only</SelectItem>
                      <SelectItem value="EDITOR">Editor - Can view and edit</SelectItem>
                      <SelectItem value="MANAGER">Manager - Full access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Add a message for the recipient"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSharing}
                    rows={2}
                  />
                </div>

                <Button onClick={handleShare} disabled={!email.trim() || isSharing} className="w-full">
                  {isSharing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Share File
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Public Sharing</h4>
              <Button variant="outline" onClick={() => setPublicLinksOpen(true)} className="w-full">
                <Globe className="h-4 w-4 mr-2" />
                Manage Public Links
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PublicLinksManager open={publicLinksOpen} onOpenChange={setPublicLinksOpen} />
    </>
  )
}
