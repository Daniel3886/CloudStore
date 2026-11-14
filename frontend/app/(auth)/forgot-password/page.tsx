import { getTranslations } from "next-intl/server"
import { AuthPageShell } from "@/features/auth/components/auth-page-shell"
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form"

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth")

  return (
    <AuthPageShell title={t("forgotPassword.title")}>
      <ForgotPasswordForm />
    </AuthPageShell>
  )
}
