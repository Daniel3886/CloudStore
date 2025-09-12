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
import { getVirtualFolders, setVirtualFolders } from "@/lib/auth"

interface NewFolderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPath?: string
  onFolderCreated?: () => void
}

export function NewFolderModal({
  open,
  onOpenChange,
  currentPath = "",
  onFolderCreated,
}: NewFolderModalProps) {
  const [folderName, setFolderName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = folderName.trim()
    if (!trimmedName) return

    const invalidChars = /[\/\\:\?\*"<>\|]/
    if (invalidChars.test(trimmedName)) {
      toast({
        variant: "destructive",
        title: "Invalid folder name",
        description: "Folder names cannot contain / \\ : ? * \" < > |",
      })
      return
    }

    setIsCreating(true)

    try {
      const existingFolders = getVirtualFolders()

      const fullFolderPath = currentPath ? `${currentPath}/${trimmedName}` : trimmedName

      if (existingFolders.includes(fullFolderPath)) {
        toast({
          variant: "destructive",
          title: "Folder already exists",
          description: `A folder named "${trimmedName}" already exists in this location.`,
        })
        setIsCreating(false)
        return
      }

      const updatedFolders = [...existingFolders, fullFolderPath]

      setVirtualFolders(updatedFolders)

      toast({
        title: "Folder created",
        description: `Successfully created folder "${trimmedName}"`,
      })

      if (onFolderCreated) {
        onFolderCreated()
      }

      onOpenChange(false)
      setFolderName("")

    } catch (error) {
      console.error("Error creating folder:", error)
      toast({
        variant: "destructive",
        title: "Error creating folder",
        description: "Failed to create the folder. Please try again.",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      onOpenChange(false)
      setFolderName("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
                disabled={isCreating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!folderName.trim() || isCreating}
            >
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}