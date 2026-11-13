"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { getErrorMessage } from "@/lib/api/client"
import { toast } from "@/hooks/use-toast"
import { sharingApi } from "@/features/sharing/api"

export function useFileShares(fileId: number | null, enabled: boolean) {
  const t = useTranslations("sharing.toast")
  const [users, setUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const reload = useCallback(async () => {
    if (fileId === null) return
    setIsLoading(true)
    try {
      setUsers(await sharingApi.getFileSharedUsers(fileId))
    } catch (error) {
      setUsers([])
      toast({
        variant: "destructive",
        title: t("loadUsersFailed.title"),
        description: getErrorMessage(error, t("loadUsersFailed.fallback")),
      })
    } finally {
      setIsLoading(false)
    }
  }, [fileId, t])

  useEffect(() => {
    if (enabled) {
      void reload()
    } else {
      setUsers([])
    }
  }, [enabled, reload])

  const revoke = useCallback(
    async (email: string) => {
      if (fileId === null) return
      try {
        await sharingApi.revokeAccess(fileId, email)
        setUsers((current) => current.filter((user) => user !== email))
        toast({ title: t("revoked.title"), description: t("revoked.description", { email }) })
      } catch (error) {
        toast({
          variant: "destructive",
          title: t("revokeFailed.title"),
          description: getErrorMessage(error, t("revokeFailed.fallback")),
        })
      }
    },
    [fileId, t],
  )

  return { users, isLoading, reload, revoke }
}
