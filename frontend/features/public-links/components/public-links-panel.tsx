"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Globe, Loader2, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PublicFileAccessToken } from "@/features/public-links/api"
import { PublicLinkRow } from "@/features/public-links/components/public-link-row"
import { RevokeLinkDialog } from "@/features/public-links/components/revoke-link-dialog"
import { usePublicLinks } from "@/features/public-links/hooks/use-public-links"

/** Every public link the user has created, on its own page instead of a dialog. */
export function PublicLinksPanel() {
  const t = useTranslations("publicLinks.manager")
  const { links, isLoading, refresh, revoke } = usePublicLinks(true)
  const [linkToRevoke, setLinkToRevoke] = useState<PublicFileAccessToken | null>(null)

  const handleConfirmRevoke = (link: PublicFileAccessToken) => {
    setLinkToRevoke(null)
    void revoke(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{t("description")}</p>
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="h-3 w-3" aria-hidden />
            {t("activeCount", { count: links.length })}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} aria-hidden />
          {t("refresh")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12" role="status">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
          <span className="sr-only">{t("loading")}</span>
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden />
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

      <RevokeLinkDialog link={linkToRevoke} onCancel={() => setLinkToRevoke(null)} onConfirm={handleConfirmRevoke} />
    </div>
  )
}
