"use client"

import { useCallback, useState } from "react"
import { useTranslations } from "next-intl"
import { getErrorMessage } from "@/lib/api/client"
import { toast } from "@/hooks/use-toast"
import { publicLinksApi, type PublicLinkResponse } from "@/features/public-links/api"

export function useGeneratePublicLink(fileId: number) {
  const t = useTranslations("publicLinks.toast")
  const [result, setResult] = useState<PublicLinkResponse | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const generate = useCallback(async () => {
    setIsGenerating(true)
    try {
      setResult(await publicLinksApi.generatePublicLink(fileId))
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("generateFailed.title"),
        description: getErrorMessage(error, t("generateFailed.fallback")),
      })
    } finally {
      setIsGenerating(false)
    }
  }, [fileId, t])

  const reset = useCallback(() => setResult(null), [])

  return { result, isGenerating, generate, reset }
}
