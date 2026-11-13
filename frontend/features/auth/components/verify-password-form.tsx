"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "@/hooks/use-toast"
import { authApi } from "@/features/auth/api"
import { VerificationCodeForm } from "@/features/auth/components/verification-code-form"
import { authFlowStorage } from "@/features/auth/lib/flow-storage"
import { VALIDATION_LIMITS } from "@/features/auth/lib/validation"

export function VerifyPasswordForm() {
  const t = useTranslations("auth")
  const router = useRouter()

  const handleVerify = async (email: string, code: string) => {
    const resetToken = await authApi.verifyPasswordResetCode(email, code)
    authFlowStorage.completeResetVerification({ email, resetToken })
    toast({
      variant: "success",
      title: t("verifyPassword.successTitle"),
      description: t("verifyPassword.successDescription"),
    })
    router.push("/reset-password")
  }

  return (
    <VerificationCodeForm
      readStoredEmail={authFlowStorage.getPasswordResetEmail}
      description={t("verifyPassword.description", VALIDATION_LIMITS)}
      contextLabel={t("verifyPassword.context")}
      submitLabel={t("verifyPassword.submit")}
      submitErrorMessage={t("verifyPassword.error")}
      backHref="/forgot-password"
      backLabel={t("verifyPassword.backToForgotPassword")}
      onVerify={handleVerify}
      onResend={authApi.requestPasswordReset}
    />
  )
}
