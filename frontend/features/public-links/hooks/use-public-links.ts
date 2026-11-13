"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { getErrorMessage } from "@/lib/api/client"
import { toast } from "@/hooks/use-toast"
import { publicLinksApi, type PublicFileAccessToken } from "@/features/public-links/api"

export function usePublicLinks(enabled: boolean) {
  const t = useTranslations("publicLinks.toast")
  const [links, setLinks] = useState<PublicFileAccessToken[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      setLinks(await publicLinksApi.getActiveLinks())
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("loadFailed.title"),
        description: getErrorMessage(error, t("loadFailed.fallback")),
      })
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (enabled) void refresh()
  }, [enabled, refresh])

  const revoke = useCallback(
    async (link: PublicFileAccessToken) => {
      try {
        await publicLinksApi.revokePublicLink(link.token)
        setLinks((current) => current.filter((item) => item.token !== link.token))
        toast({ title: t("revoked.title"), description: t("revoked.description", { name: link.file.displayName }) })
      } catch (error) {
        toast({
          variant: "destructive",
          title: t("revokeFailed.title"),
          description: getErrorMessage(error, t("revokeFailed.fallback")),
        })
      }
    },
    [t],
  )

  return { links, isLoading, refresh, revoke }
}
