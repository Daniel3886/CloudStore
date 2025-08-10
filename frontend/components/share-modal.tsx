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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Copy, FileIcon, Link, Mail, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: any
}

export function ShareModal({ open, onOpenChange, file }: ShareModalProps) {
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState("viewer")

  const handleShare = () => {
    if (!email.trim()) return

    // In a real app, you would call an API to share the file
    toast({
      variant: "success",
      title: "File shared",
      description: `Successfully shared "${file.name}" with ${email}`,
    })

    setEmail("")
  }

  const copyLink = () => {
    // In a real app, you would generate and copy a sharing link
    navigator.clipboard.writeText(`https://cloudstore.example/share/${file.id}`)

    toast({
      variant: "success",
      title: "Link copied",
      description: "Sharing link copied to clipboard",
    })
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

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Select value={permission} onValueChange={setPermission}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>People with access</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">John Doe (You)</p>
                      <p className="text-xs text-muted-foreground">john.doe@example.com</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Owner</div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Anyone with the link can view</Label>
              <div className="flex gap-2">
                <Input readOnly value={`https://cloudstore.example/share/${file?.id || "abc123"}`} />
                <Button variant="outline" size="icon" onClick={copyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Link permissions</Label>
              <Select defaultValue="viewer">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer (can view)</SelectItem>
                  <SelectItem value="editor">Editor (can edit)</SelectItem>
                  <SelectItem value="commenter">Commenter (can comment)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleShare} disabled={!email.trim()}>
            <Mail className="h-4 w-4 mr-2" />
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
