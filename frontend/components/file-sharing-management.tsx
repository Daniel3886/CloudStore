"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
 
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { Users, Mail, X, Loader2, UserPlus, Share2 } from "lucide-react"
import { FileSharingAPI, type ShareFileRequest } from "@/lib/file-sharing"

interface FileSharingManagementProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: {
    id?: string | number
    name: string
    s3Key?: string
    displayName?: string
  }
}

export function FileSharingManagement({ open, onOpenChange, file }: FileSharingManagementProps) {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSharing, setIsSharing] = useState(false)
  const [sharedUsers, setSharedUsers] = useState<string[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [actualFileId, setActualFileId] = useState<number | null>(null)

  useEffect(() => {
    if (open && file) {
      initializeManagement()
    } else {
      resetState()
    }
  }, [open, file])

  const resetState = () => {
    setSharedUsers([])
    setEmail("")
    setMessage("")
    setActualFileId(null)
  }

  const initializeManagement = async () => {

    if (!file) {
      return
    }

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

        try {
          const userFiles = await FileSharingAPI.getUserFiles()

          if (file.s3Key) {
            const matchByS3Key = userFiles.find((f) => f.s3Key === file.s3Key)
            if (matchByS3Key) {
              fileId = matchByS3Key.id
            } else {
              console.error("No S3 key match found " + file.s3Key)
            }
          }

          if (!fileId) {
            const fileName = file.displayName || file.name

            const matchByName = userFiles.find((f) => {
              const nameMatch = f.displayName === fileName
              return nameMatch
            })

            if (matchByName) {
              fileId = matchByName.id
            } else {
              console.error("No name match found" + file.name)
            }
          }
        } catch (error) {
          console.error("Error in getUserFiles:", error)
        }
      }

      if (fileId) {
        setActualFileId(fileId)
        await loadSharedUsers(fileId)
      } else {
        toast({
          variant: "destructive",
          title: "File identification issue",
          description: "Having trouble identifying this file. Check console for details.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error loading file",
        description: "An unexpected error occurred. Check console for details.",
      })
    }
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

  const handleShare = async () => {
    if (!email.trim() || !actualFileId) return

    setIsSharing(true)
    try {
      const shareRequest: ShareFileRequest = {
        fileId: actualFileId,
        targetUserEmail: email.trim(),
        message: message.trim() || undefined,
      }

      await FileSharingAPI.shareFile(shareRequest)

      toast({
        title: "File shared successfully",
        description: `"${file.name}" has been shared with ${email}`,
      })

      setEmail("")
      setMessage("")
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Manage Sharing - {file.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Share with someone new
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    placeholder="Enter email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSharing || !actualFileId}
                  />
                </div>
              
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a message for the recipient"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSharing || !actualFileId}
                  rows={2}
                />
              </div>

              <Button onClick={handleShare} disabled={!email.trim() || isSharing || !actualFileId} className="w-full">
                {isSharing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Share File
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                People with access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">You (Owner)</p>
                      <p className="text-xs text-muted-foreground">Full access to this file</p>
                    </div>
                  </div>
                  <Badge variant="default">Owner</Badge>
                </div>

                <Separator />

                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : sharedUsers.length > 0 ? (
                  <div className="space-y-2">
                    {sharedUsers.map((userEmail) => (
                      <div
                        key={userEmail}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{userEmail.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{userEmail}</p>
                            <p className="text-xs text-muted-foreground">Has access to this file</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Shared</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRevokeAccess(userEmail)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No one else has access to this file</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
