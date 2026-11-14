"use client"

import { useCallback, useState } from "react"
import { useTranslations } from "next-intl"
import { useErrorMessage } from "@/hooks/use-error-message"
import { toast } from "@/hooks/use-toast"
import { sharingApi } from "@/features/sharing/api"
import { isValidEmail } from "@/features/sharing/lib/share"

interface UseShareFileOptions {
  fileId: number | null
  fileName: string
  onShared?: () => void
}

export function useShareFile({ fileId, fileName, onShared }: UseShareFileOptions) {
  const t = useTranslations("sharing")
  const errorMessage = useErrorMessage()
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [emailError, setEmailError] = useState<string | undefined>()
  const [isSharing, setIsSharing] = useState(false)

  const changeEmail = useCallback((value: string) => {
    setEmail(value)
    setEmailError(undefined)
  }, [])

  const reset = useCallback(() => {
    setEmail("")
    setMessage("")
    setEmailError(undefined)
  }, [])

  const share = useCallback(async () => {
    const targetUserEmail = email.trim()
    if (!targetUserEmail || fileId === null) return
    if (!isValidEmail(targetUserEmail)) {
      setEmailError(t("form.invalidEmail"))
      return
    }

    setIsSharing(true)
    try {
      await sharingApi.shareFile({ fileId, targetUserEmail, message: message.trim() || undefined })
      toast({
        title: t("toast.shared.title"),
        description: t("toast.shared.description", { name: fileName, email: targetUserEmail }),
      })
      reset()
      onShared?.()
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("toast.shareFailed.title"),
        description: errorMessage(error, t("toast.shareFailed.fallback")),
      })
    } finally {
      setIsSharing(false)
    }
  }, [errorMessage, email, message, fileId, fileName, onShared, reset, t])

  return { email, message, emailError, isSharing, setEmail: changeEmail, setMessage, share, reset }
}
