"use client"

import { useCallback, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "@/hooks/use-toast"
import { authApi } from "@/features/auth/api"
import { getErrorMessage } from "@/lib/api/client"

interface UseDeleteAccountOptions {
  email: string | undefined
  onDeleted: () => void
}

export function useDeleteAccount({ email, onDeleted }: UseDeleteAccountOptions) {
  const t = useTranslations("settings.deleteAccount")
  const [isOpen, setIsOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const setOpen = useCallback((open: boolean) => {
    setIsOpen(open)
    if (!open) setPassword("")
  }, [])

  const submit = useCallback(async () => {
    if (!password || !email) {
      toast({
        variant: "destructive",
        title: t("passwordRequired.title"),
        description: t("passwordRequired.description"),
      })
      return
    }

    setIsDeleting(true)
    try {
      await authApi.deleteAccount(email, password)
      setIsOpen(false)
      setPassword("")
      toast({ title: t("success.title"), description: t("success.description") })
      onDeleted()
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("error.title"),
        description: getErrorMessage(err, t("error.fallback")),
      })
    } finally {
      setIsDeleting(false)
    }
  }, [email, onDeleted, password, t])

  return {
    isOpen,
    setOpen,
    password,
    setPassword,
    isDeleting,
    canSubmit: !isDeleting && Boolean(password),
    submit,
  }
}
