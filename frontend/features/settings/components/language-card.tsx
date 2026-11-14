"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Languages, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { setUserLocale } from "@/i18n/actions"
import { isLocale, localeLabels, locales } from "@/i18n/config"
import { useErrorMessage } from "@/hooks/use-error-message"

export function LanguageCard() {
  const t = useTranslations("settings.language")
  const errorMessage = useErrorMessage()
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const changeLocale = (next: string) => {
    if (!isLocale(next) || next === locale) return
    startTransition(async () => {
      try {
        await setUserLocale(next)
        router.refresh()
      } catch (error) {
        toast({
          variant: "destructive",
          title: t("error.title"),
          description: errorMessage(error, t("error.fallback")),
        })
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="settings-language">{t("label")}</Label>
        <div className="flex items-center gap-2">
          <Select value={locale} onValueChange={changeLocale} disabled={isPending}>
            <SelectTrigger id="settings-language" className="w-full sm:w-64" aria-label={t("label")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locales.map((option) => (
                <SelectItem key={option} value={option} lang={option}>
                  {localeLabels[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />}
        </div>
      </CardContent>
    </Card>
  )
}
