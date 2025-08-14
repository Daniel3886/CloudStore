"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Copy, FileIcon, Link, Mail, Users, X, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileSharingAPI, type ShareFileRequest } from "@/lib/file-sharing"

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: {
    id?: string | number
    name: string
    s3Key?: string
    displayName?: string
  }
}

export function ShareModal({ open, onOpenChange, file }: ShareModalProps) {
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState<"VIEWER" | "EDITOR" | "MANAGER">("VIEWER")
  const [message, setMessage] = useState("")
  const [isSharing, setIsSharing] = useState(false)
  const [sharedUsers, setSharedUsers] = useState<string[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [publicLink, setPublicLink] = useState("")
  const [actualFileId, setActualFileId] = useState<number | null>(null)
  const [isLoadingFileId, setIsLoadingFileId] = useState(false)

  useEffect(() => {
    if (open && file) {
      initializeModal()
    } else {
      resetModal()
    }
  }, [open, file])

  const resetModal = () => {
    setSharedUsers([])
    setEmail("")
    setMessage("")
    setPermission("VIEWER")
    setPublicLink("")
    setActualFileId(null)
  }

  const initializeModal = async () => {

    if (!file) {
      console.error("No file object provided")
      return
    }

    setIsLoadingFileId(true)

    try {
      let fileId: number | null = null

      if (typeof file.id === "number") {
        fileId = file.id
      } else if (file.id && typeof file.id === "string") {
        const parsedId = Number.parseInt(file.id, 10)
        if (!isNaN(parsedId)) {
          fileId = parsedId
        }
      }

      if (!fileId) {
        const userFiles = await FileSharingAPI.getUserFiles()

        if (file.s3Key) {
          const matchByS3Key = userFiles.find((f) => f.s3Key === file.s3Key)
          if (matchByS3Key) {
            fileId = matchByS3Key.id
          }
        }

        if (!fileId) {
          const fileName = file.displayName || file.name
          const matchByName = userFiles.find((f) => f.displayName === fileName)
          if (matchByName) {
            fileId = matchByName.id
          }
        }
      }

      if (fileId) {
        setActualFileId(fileId)
        await loadSharedUsers(fileId)
      } else {
        toast({
          variant: "destructive",
          title: "Cannot share file",
          description: "Unable to identify this file for sharing",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load file information",
      })
    } finally {
      setIsLoadingFileId(false)
    }

    generatePublicLink()
  }

  const loadSharedUsers = async (fileId: number) => {

    setIsLoadingUsers(true)
    try {
      const users = await FileSharingAPI.getFileSharedUsers(fileId)
      setSharedUsers(users)
    } catch (error: any) {
      setSharedUsers([])
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const generatePublicLink = () => {
    const baseUrl = window.location.origin
    setPublicLink(`${baseUrl}/public/file/${file?.s3Key || file?.id || "unknown"}`)
  }

  const handleShare = async () => {
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter an email address",
      })
      return
    }

    if (!actualFileId) {
      toast({
        variant: "destructive",
        title: "Cannot share file",
        description: "File ID not available",
      })
      return
    }

    setIsSharing(true)
    try {
      const shareRequest: ShareFileRequest = {
        fileId: actualFileId,
        targetUserEmail: email.trim(),
        permissionType: permission,
        message: message.trim() || undefined,
      }

      await FileSharingAPI.shareFile(shareRequest)

      toast({
        title: "File shared successfully",
        description: `"${file.name}" has been shared with ${email}`,
      })

      setEmail("")
      setMessage("")
      setPermission("VIEWER")
      await loadSharedUsers(actualFileId)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to share file",
        description: error.message || "Could not share the file",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleRevokeAccess = async (userEmail: string) => {
    if (!actualFileId) return

    try {
      await FileSharingAPI.revokeAccess(actualFileId, userEmail)

      toast({
        title: "Access revoked",
        description: `Removed access for ${userEmail}`,
      })

      await loadSharedUsers(actualFileId)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to revoke access",
        description: error.message || "Could not revoke access",
      })
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(publicLink)
    toast({
      title: "Link copied",
      description: "Sharing link copied to clipboard",
    })
  }

  if (isLoadingFileId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
            <DialogDescription>Preparing file for sharing...</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{file?.name}"</DialogTitle>
          <DialogDescription>Share this file with others or get a shareable link.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="people">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="people">
              <Users className="h-4 w-4 mr-2" />
              People
            </TabsTrigger>
            <TabsTrigger value="link">
              <Link className="h-4 w-4 mr-2" />
              Get Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="people" className="space-y-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-muted">
                <FileIcon className="h-4 w-4" />
              </div>
              <div className="text-sm font-medium">{file?.name}</div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="email">Share with</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="email"
                    placeholder="Enter email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSharing || !actualFileId}
                  />
                  <Select
                    value={permission}
                    onValueChange={(value: "VIEWER" | "EDITOR" | "MANAGER") => setPermission(value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                      <SelectItem value="EDITOR">Editor</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Textarea
                  placeholder="Add a message (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSharing || !actualFileId}
                  rows={2}
                />

                <Button onClick={handleShare} disabled={!email.trim() || isSharing || !actualFileId} className="w-full">
                  {isSharing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Share
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>People with access</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">You (Owner)</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Owner</div>
                </div>

                {isLoadingUsers ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  sharedUsers.map((userEmail) => (
                    <div key={userEmail} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{userEmail.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{userEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground">Shared</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRevokeAccess(userEmail)}
                          className="h-6 w-6 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}

                {!isLoadingUsers && sharedUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No one else has access to this file</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Public sharing link</Label>
              <div className="flex gap-2">
                <Input readOnly value={publicLink} />
                <Button variant="outline" size="icon" onClick={copyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Anyone with this link can view the file</p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
