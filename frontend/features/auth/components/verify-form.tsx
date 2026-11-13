"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "@/hooks/use-toast"
import { authApi } from "@/features/auth/api"
import { useAuth } from "@/features/auth/components/auth-provider"
import { VerificationCodeForm } from "@/features/auth/components/verification-code-form"
import { authFlowStorage } from "@/features/auth/lib/flow-storage"

export function VerifyForm() {
  const t = useTranslations("auth")
  const router = useRouter()
  const { login } = useAuth()

  const handleVerify = async (email: string, code: string) => {
    const token = await authApi.verifyAccount(email, code)
    await login(token)
    authFlowStorage.clearPendingVerificationEmail()
    toast({ variant: "success", title: t("verify.successTitle"), description: t("verify.successDescription") })
    router.push("/files")
  }

  return (
    <VerificationCodeForm
      readStoredEmail={authFlowStorage.getPendingVerificationEmail}
      description={t("verify.description")}
      contextLabel={t("verify.context")}
      submitLabel={t("verify.submit")}
      submitErrorMessage={t("verify.error")}
      backHref="/login"
      backLabel={t("backToLogin")}
      onVerify={handleVerify}
      onResend={authApi.resendVerificationCode}
    />
  )
}
