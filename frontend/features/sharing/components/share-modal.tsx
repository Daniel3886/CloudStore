"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { ArrowRight, Globe, Mail, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FilePublicLink } from "@/features/public-links/components/file-public-link"
import { ShareForm } from "@/features/sharing/components/share-form"
import { toFileId } from "@/features/sharing/lib/share"

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: {
    id?: string | number
    name: string
    displayName?: string
    size?: number
  }
}

export function ShareModal({ open, onOpenChange, file }: ShareModalProps) {
  const t = useTranslations("sharing.shareModal")
  const fileName = file.displayName || file.name
  const fileId = toFileId(file.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" aria-hidden />
            {t("title", { name: fileName })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" aria-hidden />
                {t("specificUsers")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ShareForm key={String(file.id)} fileId={fileId} fileName={fileName} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" aria-hidden />
                {t("publicSharing")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <FilePublicLink fileId={fileId} fileSize={file.size} enabled={open} />
              <Link
                href="/shared#public-links"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                {t("allPublicLinks")}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
