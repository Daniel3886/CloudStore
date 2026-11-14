"use client"

import type React from "react"
import { useTranslations } from "next-intl"
import { Download, Edit, MoreVertical, Share2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileIconComponent } from "@/features/files/components/file-icons"
import { useFileFormatters } from "@/features/files/hooks/use-file-formatters"
import { cn } from "@/lib/utils"
import type { FileAction, FileItem } from "@/features/files/types"

interface FileCardProps {
  file: FileItem
  isLoading: boolean
  isTrashView?: boolean
  onFileClick: (file: FileItem) => void
  onFileAction: (action: FileAction, file: FileItem) => void
}

export function FileCard({ file, isLoading, isTrashView = false, onFileClick, onFileAction }: FileCardProps) {
  const t = useTranslations("files")
  const { formatSize } = useFileFormatters()

  const actionHandler = (action: FileAction) => (e: React.MouseEvent) => {
    e.stopPropagation()
    onFileAction(action, file)
  }
  const canOpen = file.isFolder && !isTrashView

  return (
    <Card
      className={cn(
        "relative overflow-hidden hover:shadow-md hover:bg-muted/30 transition-all duration-200 focus-within:ring-2 focus-within:ring-ring",
        canOpen && "cursor-pointer",
      )}
    >
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="pointer-events-none">
              <FileIconComponent fileType={file.type} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative z-10 -mr-2 -mt-2 hover:bg-muted/60"
                  disabled={isLoading}
                  aria-label={t("card.actionsLabel", { name: file.name })}
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
                <DropdownMenuLabel>{t("card.actions")}</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isTrashView ? (
                  <>
                    <DropdownMenuItem onClick={actionHandler("restore")}>
                      <Download className="mr-2 h-4 w-4" />
                      {t("card.restore")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={actionHandler("permanent-delete")} className="text-red-500">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("card.deletePermanently")}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={actionHandler("download")}>
                      <Download className="mr-2 h-4 w-4" />
                      {file.isFolder ? t("card.downloadZip") : t("card.download")}
                    </DropdownMenuItem>
                    {!file.isFolder && (
                      <DropdownMenuItem onClick={actionHandler("share")}>
                        <Share2 className="h-4 w-4 mr-2" />
                        {t("card.share")}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={actionHandler("rename")}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t("card.rename")}
                    </DropdownMenuItem>
                    {!file.isFolder && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={actionHandler("details")}>{t("card.details")}</DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={actionHandler("delete")} className="text-red-500">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {file.isFolder ? t("card.deletePermanently") : t("card.moveToTrash")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mt-4">
            <h3 className="font-medium truncate" title={file.name}>
              {canOpen ? (
                <button
                  type="button"
                  className="max-w-full truncate text-left outline-none after:absolute after:inset-0"
                  onClick={() => onFileClick(file)}
                >
                  {file.name}
                </button>
              ) : (
                file.name
              )}
            </h3>
            <div className="mt-1 text-xs text-muted-foreground pointer-events-none">
              {file.isFolder ? <p>{t("browser.folder")}</p> : <p>{formatSize(file.size ?? 0)}</p>}
              {isTrashView && <p className="text-red-500">{t("browser.inTrash")}</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
