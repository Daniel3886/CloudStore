"use client"

import type React from "react"
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
import { FormError } from "@/components/ui/form-error"
import { getFileExtension, getFileNameWithoutExtension, validateFileName } from "@/lib/file-utils"

interface FileItem {
  id: string
  name: string
  type: string
  size: number | null
  modified: string
  owner?: string
  s3Key?: string
  displayName: string
  path: string
  isFolder: boolean
}

interface RenameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileItem | null
  onRename: (file: FileItem, newName: string) => Promise<string>
  isLoading: boolean
}

export function RenameDialog({ open, onOpenChange, file, onRename, isLoading }: RenameDialogProps) {
  const [newFileName, setNewFileName] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (file && open) {
      setNewFileName(file.name)
      setError("")
    }
  }, [file, open])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setError("") 

    if (file?.isFolder) {
      setNewFileName(value)
    } else {
      const extension = getFileExtension(file?.name || "")
      if (value.trim()) {
        setNewFileName(value + extension)
      } else {
        setNewFileName("")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    const trimmedName = file.isFolder ? newFileName.trim() : getFileNameWithoutExtension(newFileName).trim()
    const finalName = file.isFolder ? trimmedName : trimmedName + getFileExtension(file.name)

    const validationError = validateFileName(finalName, file.isFolder)
    if (validationError) {
      setError(validationError)
      return
    }

    const renameError = await onRename(file, finalName)
    if (renameError) {
      setError(renameError)
    } else {
      onOpenChange(false)
      setNewFileName("")
      setError("")
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setNewFileName("")
    setError("")
  }

  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename {file.isFolder ? "folder" : "file"}</DialogTitle>
          <DialogDescription>
            Enter a new name for "{file.name}".
            {!file.isFolder && " The file extension will be preserved."}
            {file.isFolder && " All files in this folder will be updated accordingly."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && <FormError message={error} />}
            <div className="grid gap-2">
              <Label htmlFor="filename">Name</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="filename"
                  value={file.isFolder ? newFileName : getFileNameWithoutExtension(newFileName)}
                  onChange={handleInputChange}
                  placeholder={file.isFolder ? "Enter folder name" : "Enter file name"}
                  disabled={isLoading}
                  className={`flex-1 ${error ? "border-red-500 focus:border-red-500" : ""}`}
                />
                {!file.isFolder && getFileExtension(file.name) && (
                  <span className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded">
                    {getFileExtension(file.name)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !newFileName.trim()}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Renaming...
                </>
              ) : (
                "Rename"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
