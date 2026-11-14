import { getTranslations } from "next-intl/server"
import { AuthPageShell } from "@/features/auth/components/auth-page-shell"
import { RegisterForm } from "@/features/auth/components/register-form"

export default async function RegisterPage() {
  const t = await getTranslations("auth")

  return (
    <AuthPageShell title={t("register.title")}>
      <RegisterForm />
    </AuthPageShell>
  )
}
