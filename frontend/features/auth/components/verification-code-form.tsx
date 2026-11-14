"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Mail, Shield } from "lucide-react"
import { FormError } from "@/components/ui/form-error"
import { toast } from "@/hooks/use-toast"
import { getErrorMessage } from "@/lib/api/client"
import { AuthInput } from "@/features/auth/components/auth-input"
import { BackLink } from "@/features/auth/components/back-link"
import { LoadingButton, SubmitButton } from "@/features/auth/components/loading-button"
import { StatusIcon } from "@/features/auth/components/status-icon"
import { useAuthForm } from "@/features/auth/hooks/use-auth-form"
import { useResendCode } from "@/features/auth/hooks/use-resend-code"
import { VALIDATION_LIMITS, validateEmail, validateVerificationCode } from "@/lib/validation"

interface VerificationCodeFormProps {
  readStoredEmail: () => string | null
  description: string
  contextLabel: string
  submitLabel: string
  submitErrorMessage: string
  backHref: string
  backLabel: string
  onVerify: (email: string, code: string) => Promise<void>
  onResend: (email: string) => Promise<unknown>
}

export function VerificationCodeForm({
  readStoredEmail,
  description,
  contextLabel,
  submitLabel,
  submitErrorMessage,
  backHref,
  backLabel,
  onVerify,
  onResend,
}: VerificationCodeFormProps) {
  const t = useTranslations("auth")
  const form = useAuthForm({ email: "", verificationCode: "" })
  const [hasStoredEmail, setHasStoredEmail] = useState(false)
  const { values, setValue, validate, setFormError } = form

  useEffect(() => {
    const storedEmail = readStoredEmail()
    if (storedEmail) {
      setValue("email", storedEmail)
      setHasStoredEmail(true)
    }
  }, [readStoredEmail, setValue])

  const sendNewCode = useCallback(async () => {
    await onResend(values.email)
    toast({ variant: "success", title: t("resendCode.successTitle"), description: t("resendCode.successDescription") })
  }, [onResend, values.email, t])

  const resend = useResendCode(sendNewCode)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const isValid = validate({
      email: validateEmail(values.email),
      verificationCode: validateVerificationCode(values.verificationCode),
    })
    if (!isValid) return

    await form.run(() => onVerify(values.email, values.verificationCode), submitErrorMessage)
  }

  const handleResend = async () => {
    setFormError("")
    if (!validate({ email: validateEmail(values.email) })) return

    try {
      await resend.resend()
    } catch (error) {
      setFormError(getErrorMessage(error, t("resendCode.error")))
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <StatusIcon icon={Shield} />
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{description}</p>
          {hasStoredEmail && <p className="text-sm font-medium break-all">{values.email}</p>}
          <p className="text-xs text-muted-foreground">{contextLabel}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormError message={form.formError} />

        {!hasStoredEmail && (
          <AuthInput
            icon={Mail}
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("fields.email")}
            value={values.email}
            onChange={form.handleChange}
            error={form.errorFor("email")}
            required
          />
        )}

        <AuthInput
          icon={Shield}
          name="verificationCode"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder={t("fields.verificationCode", VALIDATION_LIMITS)}
          value={values.verificationCode}
          onChange={form.handleChange}
          error={form.errorFor("verificationCode")}
          className="text-center tracking-widest"
          maxLength={VALIDATION_LIMITS.codeLength}
          required
        />

        <SubmitButton isLoading={form.isSubmitting}>{submitLabel}</SubmitButton>
      </form>

      <div className="text-center space-y-3">
        <p className="text-xs text-muted-foreground">{t("resendCode.prompt")}</p>
        <LoadingButton
          type="button"
          variant="outline"
          onClick={handleResend}
          isLoading={resend.isResending}
          disabled={!resend.canResend}
          className="w-full h-11"
        >
          {resend.secondsLeft > 0 ? t("resendCode.countdown", { seconds: resend.secondsLeft }) : t("resendCode.button")}
        </LoadingButton>
      </div>

      <BackLink href={backHref}>{backLabel}</BackLink>
    </div>
  )
}
