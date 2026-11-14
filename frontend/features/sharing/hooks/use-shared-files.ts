"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useErrorMessage } from "@/hooks/use-error-message"
import { saveBlob } from "@/lib/download"
import { toast } from "@/hooks/use-toast"
import { filesApi } from "@/features/files/api"
import { sharingApi, type SharedFileDto } from "@/features/sharing/api"
import { getDownloadName, withShareStatus } from "@/features/sharing/lib/share"

export type SharedFileAction = "accept" | "decline" | "download"

export function useSharedFiles() {
  const t = useTranslations("sharing.toast")
  const errorMessage = useErrorMessage()
  const [files, setFiles] = useState<SharedFileDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pending, setPending] = useState<Record<number, SharedFileAction>>({})

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      setFiles(await sharingApi.getSharedFiles())
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("loadFailed.title"),
        description: errorMessage(error, t("loadFailed.fallback")),
      })
    } finally {
      setIsLoading(false)
    }
  }, [errorMessage, t])

  useEffect(() => {
    void load()
  }, [load])

  const track = useCallback(async (permissionId: number, action: SharedFileAction, run: () => Promise<void>) => {
    setPending((current) => ({ ...current, [permissionId]: action }))
    try {
      await run()
    } finally {
      setPending((current) => {
        const next = { ...current }
        delete next[permissionId]
        return next
      })
    }
  }, [])

  const respond = useCallback(
    (file: SharedFileDto, action: "accept" | "decline") =>
      track(file.permissionId, action, async () => {
        const accept = action === "accept"
        try {
          await (accept ? sharingApi.acceptShare(file.permissionId) : sharingApi.declineShare(file.permissionId))
          setFiles((current) =>
            accept
              ? withShareStatus(current, file.permissionId, "ACCEPTED", new Date().toISOString())
              : current.filter((item) => item.permissionId !== file.permissionId),
          )
          toast({
            title: t(accept ? "accepted.title" : "declined.title"),
            description: t(accept ? "accepted.description" : "declined.description", { name: file.displayName }),
          })
        } catch (error) {
          toast({
            variant: "destructive",
            title: t(accept ? "acceptFailed.title" : "declineFailed.title"),
            description: errorMessage(error, t(accept ? "acceptFailed.fallback" : "declineFailed.fallback")),
          })
        }
      }),
    [errorMessage, t, track],
  )

  const accept = useCallback((file: SharedFileDto) => respond(file, "accept"), [respond])
  const decline = useCallback((file: SharedFileDto) => respond(file, "decline"), [respond])

  const download = useCallback(
    (file: SharedFileDto) =>
      track(file.permissionId, "download", async () => {
        try {
          saveBlob(await filesApi.download(file.s3Key), getDownloadName(file.displayName))
          toast({
            title: t("downloadStarted.title"),
            description: t("downloadStarted.description", { name: file.displayName }),
          })
        } catch (error) {
          toast({
            variant: "destructive",
            title: t("downloadFailed.title"),
            description: errorMessage(error, t("downloadFailed.fallback")),
          })
        }
      }),
    [errorMessage, t, track],
  )

  return { files, isLoading, pending, accept, decline, download, reload: load }
}
