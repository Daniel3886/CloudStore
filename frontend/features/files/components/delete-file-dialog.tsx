"use client"

import { useTranslations } from "next-intl"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import type { FileItem } from "@/features/files/types"

interface DeleteFileDialogProps {
  file: FileItem | null
  permanent: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteFileDialog({ file, permanent, open, onOpenChange, onConfirm }: DeleteFileDialogProps) {
  const t = useTranslations("files.deleteDialog")
  const name = file?.name ?? ""
  const isFolder = file?.isFolder ?? false
  const destructive = permanent || isFolder

  const title = permanent
    ? t("permanentTitle", { kind: isFolder ? "folder" : "file" })
    : isFolder
      ? t("folderTitle")
      : t("trashTitle")

  const description = permanent
    ? t("permanentDescription", { name })
    : isFolder
      ? t.rich("folderDescription", { name, b: (chunks) => <b>{chunks}</b> })
      : t("trashDescription", { name })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className={!permanent && isFolder ? "text-red-600 font-semibold" : ""}>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(destructive ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600")}
          >
            {destructive ? t("deletePermanently") : t("moveToTrash")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
