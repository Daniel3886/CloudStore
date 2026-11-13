"use client"

import type React from "react"
import { useState } from "react"
import { useTranslations } from "next-intl"
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
import { joinPath, validateFileName } from "@/features/files/lib/file-utils"
import { getVirtualFolders, setVirtualFolders } from "@/features/files/lib/virtual-folders"

interface NewFolderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPath?: string
  onFolderCreated?: () => void
}

export function NewFolderModal({ open, onOpenChange, currentPath = "", onFolderCreated }: NewFolderModalProps) {
  const t = useTranslations("files")
  const [folderName, setFolderName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = folderName.trim()
    if (!trimmedName) return

    const validationError = validateFileName(trimmedName, true)
    if (validationError) {
      toast({
        variant: "destructive",
        title: t("toasts.invalidFolderName"),
        description: t(`validation.${validationError.key}`, validationError.values),
      })
      return
    }

    try {
      const existingFolders = getVirtualFolders()
      const fullFolderPath = joinPath(currentPath, trimmedName)

      if (existingFolders.includes(fullFolderPath)) {
        toast({
          variant: "destructive",
          title: t("toasts.folderExists"),
          description: t("validation.folderExists", { name: trimmedName }),
        })
        return
      }

      setVirtualFolders([...existingFolders, fullFolderPath])
      toast({
        title: t("toasts.folderCreated.title"),
        description: t("toasts.folderCreated.description", { name: trimmedName }),
      })
      onFolderCreated?.()
      onOpenChange(false)
      setFolderName("")
    } catch {
      toast({
        variant: "destructive",
        title: t("toasts.folderCreateFailed.title"),
        description: t("toasts.folderCreateFailed.description"),
      })
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) setFolderName("")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("newFolder.title")}</DialogTitle>
          <DialogDescription>
            {t("newFolder.description")}
            {currentPath && ` ${t("newFolder.location", { path: currentPath })}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">{t("newFolder.label")}</Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder={t("newFolder.placeholder")}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
              {t("newFolder.cancel")}
            </Button>
            <Button type="submit" disabled={!folderName.trim()}>
              {t("newFolder.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
