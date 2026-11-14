import { getTranslations } from "next-intl/server"
import { AuthPageShell } from "@/features/auth/components/auth-page-shell"
import { LoginForm } from "@/features/auth/components/login-form"

export default async function LoginPage() {
  const t = await getTranslations("auth")

  return (
    <AuthPageShell title={t("login.title")}>
      <LoginForm />
    </AuthPageShell>
  )
}
