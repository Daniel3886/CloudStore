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
import { FormError } from "@/components/ui/form-error"
import { cn } from "@/lib/utils"
import { getFileExtension, getFileNameWithoutExtension, validateFileName } from "@/features/files/lib/file-utils"
import type { FileItem } from "@/features/files/types"

interface RenameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileItem | null
  onRename: (file: FileItem, newName: string) => Promise<string | null>
  isLoading: boolean
}

export function RenameDialog({ open, onOpenChange, file, onRename, isLoading }: RenameDialogProps) {
  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <RenameForm
          key={file.id}
          file={file}
          onRename={onRename}
          isLoading={isLoading}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface RenameFormProps {
  file: FileItem
  onRename: RenameDialogProps["onRename"]
  isLoading: boolean
  onDone: () => void
}

function RenameForm({ file, onRename, isLoading, onDone }: RenameFormProps) {
  const t = useTranslations("files")
  const extension = file.isFolder ? "" : getFileExtension(file.name)
  const [baseName, setBaseName] = useState(file.isFolder ? file.name : getFileNameWithoutExtension(file.name))
  const [error, setError] = useState("")
  const kind = file.isFolder ? "folder" : "file"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const finalName = baseName.trim() + extension

    const validationError = validateFileName(finalName, file.isFolder)
    if (validationError) {
      setError(t(`validation.${validationError.key}`, validationError.values))
      return
    }

    const renameError = await onRename(file, finalName)
    if (renameError) setError(renameError)
    else onDone()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("rename.title", { kind })}</DialogTitle>
        <DialogDescription>
          {t("rename.description", { name: file.name })} {file.isFolder ? t("rename.folderHint") : t("rename.fileHint")}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          {error && <FormError message={error} />}
          <div className="grid gap-2">
            <Label htmlFor="filename">{t("rename.label")}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="filename"
                value={baseName}
                onChange={(e) => {
                  setError("")
                  setBaseName(e.target.value)
                }}
                placeholder={file.isFolder ? t("rename.folderPlaceholder") : t("rename.filePlaceholder")}
                disabled={isLoading}
                aria-invalid={Boolean(error)}
                className={cn("flex-1", error && "border-red-500 focus:border-red-500")}
              />
              {extension && (
                <span className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded">{extension}</span>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone} disabled={isLoading}>
            {t("rename.cancel")}
          </Button>
          <Button type="submit" disabled={isLoading || !baseName.trim()}>
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {t("rename.submitting")}
              </>
            ) : (
              t("rename.submit")
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
