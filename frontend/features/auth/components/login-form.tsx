"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Mail } from "lucide-react"
import { FormError } from "@/components/ui/form-error"
import { toast } from "@/hooks/use-toast"
import { authApi } from "@/features/auth/api"
import { AuthInput } from "@/features/auth/components/auth-input"
import { useAuth } from "@/features/auth/components/auth-provider"
import { SubmitButton } from "@/features/auth/components/loading-button"
import { PasswordInput } from "@/features/auth/components/password-input"
import { useAuthForm } from "@/features/auth/hooks/use-auth-form"
import { validateEmail, validateRequiredPassword } from "@/lib/validation"

export function LoginForm() {
  const t = useTranslations("auth")
  const router = useRouter()
  const { login } = useAuth()
  const form = useAuthForm({ email: "", password: "" })
  const { values } = form

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const isValid = form.validate({
      email: validateEmail(values.email),
      password: validateRequiredPassword(values.password),
    })
    if (!isValid) return

    await form.run(async () => {
      const tokens = await authApi.login(values.email, values.password)
      if (!tokens.accessToken || !tokens.refreshToken) {
        throw new Error(t("login.invalidResponse"))
      }

      const profile = await login(tokens.accessToken, tokens.refreshToken)
      if (!profile) throw new Error(t("login.error"))
      toast({ variant: "success", title: t("login.successTitle"), description: t("login.successDescription") })
      router.push("/files")
    }, t("login.error"))
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground text-center">{t("login.description")}</p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormError message={form.formError} />

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

        <PasswordInput
          name="password"
          autoComplete="current-password"
          placeholder={t("fields.password")}
          value={values.password}
          onChange={form.handleChange}
          error={form.errorFor("password")}
          required
        />

        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            {t("login.forgotPassword")}
          </Link>
        </div>

        <SubmitButton isLoading={form.isSubmitting}>{t("login.submit")}</SubmitButton>

        <div className="text-center pt-2">
          <span className="text-sm text-muted-foreground">
            {t("login.noAccount")}{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              {t("login.signUp")}
            </Link>
          </span>
        </div>
      </form>
    </div>
  )
}
