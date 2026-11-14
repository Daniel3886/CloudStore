import { getTranslations } from "next-intl/server"
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ResetPasswordPage() {
  const t = await getTranslations("auth.resetPassword")

  return (
    <Card className="border-muted-foreground/20 bg-card/50 backdrop-blur-sm max-w-md mx-auto mt-10 p-6">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="size-12 rounded-md bg-primary text-primary-foreground grid place-items-center text-2xl font-bold">
            CS
          </div>
        </div>
        <CardTitle className="text-2xl text-center">{t("title")}</CardTitle>
        <CardDescription className="text-center">{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  )
}
