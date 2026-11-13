"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Globe, Mail, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { PublicLinksManager } from "@/features/public-links/components/public-links-manager"
import { ShareForm } from "@/features/sharing/components/share-form"
import { toFileId } from "@/features/sharing/lib/share"

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: {
    id?: string | number
    name: string
    displayName?: string
  }
}

export function ShareModal({ open, onOpenChange, file }: ShareModalProps) {
  const t = useTranslations("sharing.shareModal")
  const [publicLinksOpen, setPublicLinksOpen] = useState(false)
  const fileName = file.displayName || file.name

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t("title", { name: fileName })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t("specificUsers")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ShareForm key={String(file.id)} fileId={toFileId(file.id)} fileName={fileName} />
              </CardContent>
            </Card>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">{t("publicSharing")}</h4>
              <Button variant="outline" onClick={() => setPublicLinksOpen(true)} className="w-full">
                <Globe className="h-4 w-4 mr-2" />
                {t("managePublicLinks")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PublicLinksManager open={publicLinksOpen} onOpenChange={setPublicLinksOpen} />
    </>
  )
}
