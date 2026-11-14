"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { CheckCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/ui/form-error"
import { toast } from "@/hooks/use-toast"
import { authApi } from "@/features/auth/api"
import { AuthInput } from "@/features/auth/components/auth-input"
import { BackLink } from "@/features/auth/components/back-link"
import { SubmitButton } from "@/features/auth/components/loading-button"
import { StatusIcon } from "@/features/auth/components/status-icon"
import { useAuthForm } from "@/features/auth/hooks/use-auth-form"
import { useDelayedRedirect } from "@/features/auth/hooks/use-delayed-redirect"
import { authFlowStorage } from "@/features/auth/lib/flow-storage"
import { VALIDATION_LIMITS, validateEmail } from "@/lib/validation"

const VERIFY_PATH = "/verify-password"
const REDIRECT_DELAY_MS = 2000

export function ForgotPasswordForm() {
  const t = useTranslations("auth")
  const router = useRouter()
  const redirect = useDelayedRedirect()
  const form = useAuthForm({ email: "" })
  const [emailSent, setEmailSent] = useState(false)
  const { email } = form.values

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.validate({ email: validateEmail(email) })) return

    await form.run(async () => {
      await authApi.requestPasswordReset(email)
      setEmailSent(true)
      authFlowStorage.startPasswordReset(email)
      toast({
        variant: "success",
        title: t("forgotPassword.successTitle"),
        description: t("forgotPassword.successDescription", VALIDATION_LIMITS),
      })
      redirect.schedule(VERIFY_PATH, REDIRECT_DELAY_MS)
    }, t("forgotPassword.error"))
  }

  const handleTryAnotherEmail = () => {
    redirect.cancel()
    setEmailSent(false)
  }

  if (emailSent) {
    return (
      <div className="space-y-6">
        <StatusIcon icon={CheckCircle} variant="success" />

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">{t("forgotPassword.sentTitle")}</h3>
          <p className="text-sm text-muted-foreground">{t("forgotPassword.sentDescription", VALIDATION_LIMITS)}</p>
          <p className="text-sm font-medium break-all">{email}</p>
          <p className="text-xs text-muted-foreground mt-2">{t("forgotPassword.redirecting")}</p>
        </div>

        <div className="space-y-3">
          <Button onClick={() => router.push(VERIFY_PATH)} className="w-full h-11">
            {t("forgotPassword.continue")}
          </Button>
          <Button variant="outline" onClick={handleTryAnotherEmail} className="w-full h-11">
            {t("forgotPassword.tryAnotherEmail")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <StatusIcon icon={Mail} />
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {t("forgotPassword.description", VALIDATION_LIMITS)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormError message={form.formError} />

        <AuthInput
          icon={Mail}
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("fields.email")}
          value={email}
          onChange={form.handleChange}
          error={form.errorFor("email")}
          required
        />

        <SubmitButton isLoading={form.isSubmitting}>{t("forgotPassword.submit")}</SubmitButton>
      </form>

      <BackLink href="/login">{t("backToLogin")}</BackLink>
    </div>
  )
}
