"use client"

import type React from "react"

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
import { toast } from "@/hooks/use-toast"

interface NewFolderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPath?: string
  virtualFolders?: string[]
  saveVirtualFolders?: (folders: string[]) => void
}

export function NewFolderModal({
  open,
  onOpenChange,
  currentPath = "",
  virtualFolders = [],
  saveVirtualFolders,
}: NewFolderModalProps) {
  const [folderName, setFolderName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!folderName.trim()) return

    const fullFolderPath = currentPath ? `${currentPath}/${folderName.trim()}` : folderName.trim()

    if (saveVirtualFolders) {
      const updatedFolders = [...virtualFolders, fullFolderPath]
      saveVirtualFolders(updatedFolders)
    }

    toast({
      variant: "success",
      title: "Folder created",
      description: `Successfully created folder "${folderName}"`,
    })

    onOpenChange(false)
    setFolderName("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new folder</DialogTitle>
          <DialogDescription>
            Enter a name for your new folder.
            {currentPath && ` It will be created in: ${currentPath}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Folder name</Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="My new folder"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!folderName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
