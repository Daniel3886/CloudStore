"use client"

import { useTranslations } from "next-intl"
import { Loader2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PasswordField } from "@/features/settings/components/password-field"
import { useChangePassword } from "@/features/settings/hooks/use-change-password"

export function ChangePasswordCard({ email }: { email?: string }) {
  const t = useTranslations("settings.changePassword")
  const { values, setField, isSubmitting, canSubmit, submit } = useChangePassword(email)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PasswordField
          id="current-password"
          label={t("currentPassword")}
          value={values.currentPassword}
          onChange={(value) => setField("currentPassword", value)}
          autoComplete="current-password"
        />
        <PasswordField
          id="new-password"
          label={t("newPassword")}
          value={values.newPassword}
          onChange={(value) => setField("newPassword", value)}
          autoComplete="new-password"
        />
        <PasswordField
          id="confirm-password"
          label={t("confirmPassword")}
          value={values.confirmPassword}
          onChange={(value) => setField("confirmPassword", value)}
          autoComplete="new-password"
        />

        <Button onClick={submit} disabled={!canSubmit}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("submitting")}
            </>
          ) : (
            t("submit")
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
