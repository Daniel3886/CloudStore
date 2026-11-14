import type React from "react"
import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface AuthPageShellProps {
  title: string
  children: React.ReactNode
}

export async function AuthPageShell({ title, children }: AuthPageShellProps) {
  const t = await getTranslations("common")

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="size-16 rounded-xl bg-primary text-primary-foreground grid place-items-center text-2xl font-bold">
              CS
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{t("appName")}</h1>
            <p className="text-muted-foreground">{t("appTagline")}</p>
          </div>
        </div>

        <Card className="border-muted-foreground/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <h2 className="text-xl font-semibold text-center">{title}</h2>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}
