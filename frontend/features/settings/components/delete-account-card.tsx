"use client"

import { useTranslations } from "next-intl"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PasswordField } from "@/features/settings/components/password-field"
import { useDeleteAccount } from "@/features/settings/hooks/use-delete-account"

interface DeleteAccountCardProps {
  email?: string
  onDeleted: () => void
}

export function DeleteAccountCard({ email, onDeleted }: DeleteAccountCardProps) {
  const t = useTranslations("settings.deleteAccount")
  const { isOpen, setOpen, password, setPassword, isDeleting, canSubmit, submit } = useDeleteAccount({
    email,
    onDeleted,
  })

  return (
    <>
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("description")}</p>
          <Separator />
          <Button variant="destructive" onClick={() => setOpen(true)} className="w-full">
            <Trash2 className="h-4 w-4 mr-2" /> {t("open")}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={isOpen} onOpenChange={(open) => !isDeleting && setOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> {t("dialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{t("dialog.warning")}</strong> {t("dialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <PasswordField
              id="delete-password"
              label={t("dialog.password")}
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              disabled={isDeleting}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("dialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                void submit()
              }}
              disabled={!canSubmit}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("dialog.deleting")}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("dialog.confirm")}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
