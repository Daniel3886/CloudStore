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
import { showSuccess, showError } from "@/components/ui/notification"

interface NewFolderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPath?: string
  virtualFolders?: string[]
  saveVirtualFolders?: (folders: string[]) => void
  onFolderCreated?: () => void
}

export function NewFolderModal({
  open,
  onOpenChange,
  currentPath = "",
  virtualFolders = [],
  saveVirtualFolders,
  onFolderCreated,
}: NewFolderModalProps) {
  const [folderName, setFolderName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!folderName.trim()) {
      showError("Invalid name", "Folder name cannot be empty.")
      return
    }

    const folderPath = currentPath ? `${currentPath}/${folderName.trim()}` : folderName.trim()

    if (virtualFolders.includes(folderPath)) {
      showError("Folder exists", "A folder with this name already exists.")
      return
    }

    if (saveVirtualFolders) {
      const updatedFolders = [...virtualFolders, folderPath]
      saveVirtualFolders(updatedFolders)
    }

    showSuccess("Folder created", `Folder "${folderName}" created successfully.`)

    if (onFolderCreated) {
      onFolderCreated()
    }

    onOpenChange(false)
    setFolderName("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new folder</DialogTitle>
          <DialogDescription>Enter a name for your new folder.</DialogDescription>
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
