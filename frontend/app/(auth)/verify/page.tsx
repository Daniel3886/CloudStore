import { getTranslations } from "next-intl/server"
import { AuthPageShell } from "@/features/auth/components/auth-page-shell"
import { VerifyForm } from "@/features/auth/components/verify-form"

export default async function VerifyPage() {
  const t = await getTranslations("auth")

  return (
    <AuthPageShell title={t("verify.title")}>
      <VerifyForm />
    </AuthPageShell>
  )
}
