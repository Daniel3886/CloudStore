"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Mail, User } from "lucide-react"
import { FormError } from "@/components/ui/form-error"
import { toast } from "@/hooks/use-toast"
import { authApi } from "@/features/auth/api"
import { AuthInput } from "@/features/auth/components/auth-input"
import { SubmitButton } from "@/features/auth/components/loading-button"
import { PasswordInput } from "@/features/auth/components/password-input"
import { useAuthForm } from "@/features/auth/hooks/use-auth-form"
import { authFlowStorage } from "@/features/auth/lib/flow-storage"
import { VALIDATION_LIMITS, validateEmail, validateNewPassword, validateUsername } from "@/features/auth/lib/validation"

export function RegisterForm() {
  const t = useTranslations("auth")
  const router = useRouter()
  const form = useAuthForm({ username: "", email: "", password: "" })
  const { values } = form

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const isValid = form.validate({
      username: validateUsername(values.username),
      email: validateEmail(values.email),
      password: validateNewPassword(values.password),
    })
    if (!isValid) return

    await form.run(async () => {
      await authApi.register(values)
      toast({ variant: "success", title: t("register.successTitle"), description: t("register.successDescription") })
      authFlowStorage.setPendingVerificationEmail(values.email)
      router.push("/verify")
    }, t("register.error"))
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground text-center">{t("register.description")}</p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormError message={form.formError} />

        <AuthInput
          icon={User}
          name="username"
          type="text"
          autoComplete="username"
          placeholder={t("register.username", VALIDATION_LIMITS)}
          value={values.username}
          onChange={form.handleChange}
          error={form.errorFor("username")}
          required
        />

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
          autoComplete="new-password"
          placeholder={t("register.password", VALIDATION_LIMITS)}
          value={values.password}
          onChange={form.handleChange}
          error={form.errorFor("password")}
          required
        />

        <SubmitButton isLoading={form.isSubmitting}>{t("register.submit")}</SubmitButton>

        <div className="text-center pt-2">
          <span className="text-sm text-muted-foreground">
            {t("register.hasAccount")}{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t("register.signIn")}
            </Link>
          </span>
        </div>
      </form>
    </div>
  )
}
