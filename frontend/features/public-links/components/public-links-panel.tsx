"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Globe, Loader2, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { PublicFileAccessToken } from "@/features/public-links/api"
import { PublicLinkRow } from "@/features/public-links/components/public-link-row"
import { RevokeLinkDialog } from "@/features/public-links/components/revoke-link-dialog"
import { usePublicLinks } from "@/features/public-links/hooks/use-public-links"

interface PublicLinksManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PublicLinksManager({ open, onOpenChange }: PublicLinksManagerProps) {
  const t = useTranslations("publicLinks.manager")
  const { links, isLoading, refresh, revoke } = usePublicLinks(open)
  const [linkToRevoke, setLinkToRevoke] = useState<PublicFileAccessToken | null>(null)

  const handleConfirmRevoke = (link: PublicFileAccessToken) => {
    setLinkToRevoke(null)
    void revoke(link)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t("title")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {t("activeCount", { count: links.length })}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                {t("refresh")}
              </Button>
            </div>

            <Separator />

            {isLoading ? (
              <div className="flex items-center justify-center py-12" role="status">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="sr-only">{t("loading")}</span>
              </div>
            ) : links.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">{t("emptyTitle")}</h3>
                <p className="text-muted-foreground">{t("emptyDescription")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {links.map((link) => (
                  <PublicLinkRow key={link.id} link={link} onRevoke={setLinkToRevoke} />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <RevokeLinkDialog link={linkToRevoke} onCancel={() => setLinkToRevoke(null)} onConfirm={handleConfirmRevoke} />
    </>
  )
}
