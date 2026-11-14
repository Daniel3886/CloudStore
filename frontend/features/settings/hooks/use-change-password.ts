"use client"

import { useCallback, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "@/hooks/use-toast"
import { authApi } from "@/features/auth/api"
import { getErrorMessage } from "@/lib/api/client"
import { VALIDATION_LIMITS } from "@/lib/validation"
import {
  EMPTY_PASSWORD_CHANGE,
  isPasswordChangeComplete,
  validatePasswordChange,
  type PasswordChangeValues,
} from "@/features/settings/lib/validation"

export function useChangePassword(email: string | undefined) {
  const t = useTranslations("settings")
  const tValidation = useTranslations("common.validation")
  const [values, setValues] = useState<PasswordChangeValues>(EMPTY_PASSWORD_CHANGE)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setField = useCallback((field: keyof PasswordChangeValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }, [])

  const submit = useCallback(async () => {
    const validationError = validatePasswordChange(values)
    if (validationError === "missingFields") {
      toast({
        variant: "destructive",
        title: t("changePassword.validation.missingFields.title"),
        description: t("changePassword.validation.missingFields.description"),
      })
      return
    }
    if (validationError) {
      toast({
        variant: "destructive",
        title: t("changePassword.validation.invalidTitle"),
        description: tValidation(validationError, VALIDATION_LIMITS),
      })
      return
    }

    if (!email) {
      toast({ variant: "destructive", title: t("missingEmail.title"), description: t("missingEmail.description") })
      return
    }

    setIsSubmitting(true)
    try {
      await authApi.changePassword(email, values.currentPassword, values.newPassword)
      toast({ title: t("changePassword.success.title"), description: t("changePassword.success.description") })
      setValues(EMPTY_PASSWORD_CHANGE)
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("changePassword.error.title"),
        description: getErrorMessage(err, t("changePassword.error.fallback")),
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [email, t, tValidation, values])

  return {
    values,
    setField,
    isSubmitting,
    canSubmit: !isSubmitting && isPasswordChangeComplete(values),
    submit,
  }
}
