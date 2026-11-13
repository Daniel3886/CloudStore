"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Download, FileIcon, Globe, Share2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ShareModal } from "@/features/sharing/components/share-modal"
import { FileSharingManagement } from "@/features/sharing/components/file-sharing-management"
import { PublicLinkGenerator } from "@/features/public-links/components/public-link-generator"
import { FileDetailsInfo } from "@/features/files/components/file-details-info"
import type { FileItem } from "@/features/files/types"

type SubModal = "share" | "manage" | "publicLink" | null

interface FileDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileItem
  onDownload: (file: FileItem) => void
}

export function FileDetailsModal({ open, onOpenChange, file, onDownload }: FileDetailsModalProps) {
  const t = useTranslations("files.details")
  const [subModal, setSubModal] = useState<SubModal>(null)

  const subModalProps = (name: Exclude<SubModal, null>) => ({
    open: subModal === name,
    onOpenChange: (isOpen: boolean) => setSubModal(isOpen ? name : null),
  })

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileIcon className="h-5 w-5" aria-hidden />
              {t("title")}
            </DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <FileDetailsInfo file={file} />

            <Separator />

            <section className="space-y-2">
              <h4 className="text-sm font-medium">{t("sharingOptions")}</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => setSubModal("share")}>
                  <Share2 className="h-4 w-4 mr-2" />
                  {t("share")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSubModal("manage")}>
                  <Users className="h-4 w-4 mr-2" />
                  {t("manage")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubModal("publicLink")}
                  className="col-span-2 bg-transparent"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {t("publicLink")}
                </Button>
              </div>
            </section>

            <Separator />

            <section className="space-y-2">
              <h4 className="text-sm font-medium">{t("fileActions")}</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => onDownload(file)}>
                  <Download className="h-4 w-4 mr-2" />
                  {t("download")}
                </Button>
              </div>
            </section>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShareModal {...subModalProps("share")} file={file} />
      <FileSharingManagement {...subModalProps("manage")} file={file} />
      <PublicLinkGenerator {...subModalProps("publicLink")} file={file} />
    </>
  )
}
