"use client"

import type React from "react"
import { useTranslations } from "next-intl"
import { Download, Edit, Info, MoreVertical, RotateCcw, Share2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { FileAction, FileItem } from "@/features/files/types"

interface FileActionsMenuProps {
  file: FileItem
  isLoading: boolean
  isTrashView: boolean
  onFileAction: (action: FileAction, file: FileItem) => void
  className?: string
}

export function FileActionsMenu({ file, isLoading, isTrashView, onFileAction, className }: FileActionsMenuProps) {
  const t = useTranslations("files.card")

  const actionHandler = (action: FileAction) => (e: React.MouseEvent) => {
    e.stopPropagation()
    onFileAction(action, file)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative z-10 hover:bg-muted/60", className)}
          disabled={isLoading}
          aria-label={t("actionsLabel", { name: file.name })}
          aria-busy={isLoading}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isTrashView ? (
          <>
            <DropdownMenuItem onClick={actionHandler("restore")}>
              <RotateCcw className="mr-2 h-4 w-4" />
              {t("restore")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={actionHandler("permanent-delete")} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              {t("deletePermanently")}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={actionHandler("download")}>
              <Download className="mr-2 h-4 w-4" />
              {file.isFolder ? t("downloadZip") : t("download")}
            </DropdownMenuItem>
            {!file.isFolder && (
              <DropdownMenuItem onClick={actionHandler("share")}>
                <Share2 className="h-4 w-4 mr-2" />
                {t("share")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={actionHandler("rename")}>
              <Edit className="mr-2 h-4 w-4" />
              {t("rename")}
            </DropdownMenuItem>
            {!file.isFolder && (
              <DropdownMenuItem onClick={actionHandler("details")}>
                <Info className="mr-2 h-4 w-4" />
                {t("details")}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={actionHandler("delete")} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              {file.isFolder ? t("deletePermanently") : t("moveToTrash")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
