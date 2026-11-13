"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { AlertTriangle, CheckCircle, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/ui/form-error"
import { toast } from "@/hooks/use-toast"
import { authApi } from "@/features/auth/api"
import { BackLink } from "@/features/auth/components/back-link"
import { SubmitButton } from "@/features/auth/components/loading-button"
import { PasswordInput } from "@/features/auth/components/password-input"
import { StatusIcon } from "@/features/auth/components/status-icon"
import { useAuthForm } from "@/features/auth/hooks/use-auth-form"
import { useDelayedRedirect } from "@/features/auth/hooks/use-delayed-redirect"
import { authFlowStorage, type ResetSession } from "@/features/auth/lib/flow-storage"
import { VALIDATION_LIMITS, validateNewPassword, validatePasswordConfirmation } from "@/features/auth/lib/validation"

const LOGIN_PATH = "/login"
const REDIRECT_DELAY_MS = 3000

type SessionState = { status: "checking" } | { status: "invalid" } | { status: "ready"; session: ResetSession }

export function ResetPasswordForm() {
  const t = useTranslations("auth")
  const [sessionState, setSessionState] = useState<SessionState>({ status: "checking" })
  const [resetSucceeded, setResetSucceeded] = useState(false)

  useEffect(() => {
    const session = authFlowStorage.getResetSession()
    setSessionState(session ? { status: "ready", session } : { status: "invalid" })
  }, [])

  if (sessionState.status === "checking") return null

  if (sessionState.status === "invalid") {
    return (
      <div className="space-y-6 text-center">
        <StatusIcon icon={AlertTriangle} variant="danger" />

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{t("resetPassword.invalidSessionTitle")}</h3>
          <p className="text-sm text-muted-foreground">{t("resetPassword.invalidSessionDescription")}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/forgot-password">{t("resetPassword.startReset")}</Link>
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href={LOGIN_PATH}>{t("backToLogin")}</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (resetSucceeded) return <ResetPasswordSuccess />

  return <NewPasswordForm session={sessionState.session} onSuccess={() => setResetSucceeded(true)} />
}

function NewPasswordForm({ session, onSuccess }: { session: ResetSession; onSuccess: () => void }) {
  const t = useTranslations("auth")
  const form = useAuthForm({ password: "", confirmPassword: "" })
  const { values } = form

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const isValid = form.validate({
      password: validateNewPassword(values.password),
      confirmPassword: validatePasswordConfirmation(values.password, values.confirmPassword),
    })
    if (!isValid) return

    await form.run(async () => {
      await authApi.resetPassword({ ...session, newPassword: values.password })
      authFlowStorage.clearResetSession()
      toast({
        variant: "success",
        title: t("resetPassword.successTitle"),
        description: t("resetPassword.successDescription"),
      })
      onSuccess()
    }, t("resetPassword.error"))
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <StatusIcon icon={Lock} />
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t("resetPassword.description")}</p>
          <p className="text-xs text-muted-foreground">{t("resetPassword.resettingFor", { email: session.email })}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormError message={form.formError} />

        <PasswordInput
          name="password"
          autoComplete="new-password"
          placeholder={t("resetPassword.newPassword", VALIDATION_LIMITS)}
          value={values.password}
          onChange={form.handleChange}
          error={form.errorFor("password")}
          required
        />

        <PasswordInput
          name="confirmPassword"
          autoComplete="new-password"
          placeholder={t("resetPassword.confirmPassword")}
          value={values.confirmPassword}
          onChange={form.handleChange}
          error={form.errorFor("confirmPassword")}
          required
        />

        <div className="text-xs text-muted-foreground space-y-1">
          <p>{t("resetPassword.requirementsTitle")}</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>{t("resetPassword.requirementLength", VALIDATION_LIMITS)}</li>
            <li>{t("resetPassword.requirementLetter")}</li>
            <li>{t("resetPassword.requirementNumber")}</li>
            <li>{t("resetPassword.requirementMatch")}</li>
          </ul>
        </div>

        <SubmitButton isLoading={form.isSubmitting}>{t("resetPassword.submit")}</SubmitButton>
      </form>

      <BackLink href={LOGIN_PATH}>{t("backToLogin")}</BackLink>
    </div>
  )
}

function ResetPasswordSuccess() {
  const t = useTranslations("auth")
  const router = useRouter()
  const { schedule } = useDelayedRedirect()

  useEffect(() => {
    schedule(LOGIN_PATH, REDIRECT_DELAY_MS)
  }, [schedule])

  return (
    <div className="space-y-6 text-center">
      <StatusIcon icon={CheckCircle} variant="success" />

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t("resetPassword.doneTitle")}</h3>
        <p className="text-sm text-muted-foreground">{t("resetPassword.doneDescription")}</p>
        <p className="text-xs text-muted-foreground mt-2">{t("resetPassword.redirecting")}</p>
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={() => router.push(LOGIN_PATH)} className="w-full">
          {t("resetPassword.goToLogin")}
        </Button>
      </div>
    </div>
  )
}
