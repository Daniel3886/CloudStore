import { getTranslations } from "next-intl/server"
import { AuthPageShell } from "@/features/auth/components/auth-page-shell"
import { VerifyPasswordForm } from "@/features/auth/components/verify-password-form"

export default async function VerifyPasswordPage() {
  const t = await getTranslations("auth")

  return (
    <AuthPageShell title={t("verifyPassword.title")}>
      <VerifyPasswordForm />
    </AuthPageShell>
  )
}
