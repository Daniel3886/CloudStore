import type React from "react"
import { getTranslations } from "next-intl/server"
import { InstanceHost } from "@/features/auth/components/instance-host"

interface AuthPageShellProps {
  title: string
  children: React.ReactNode
}

const RULES = ["upload", "link", "trash", "storage"] as const

export async function AuthPageShell({ title, children }: AuthPageShellProps) {
  const t = await getTranslations("auth.shell")
  const tCommon = await getTranslations("common")

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 font-display text-lg font-bold">
              <div className="grid size-8 place-items-center rounded-lg bg-primary text-xs font-extrabold text-primary-foreground">
                CS
              </div>
              {tCommon("appName")}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold">{title}</h1>
              <InstanceHost label={t("hostLabel")} />
            </div>
          </div>
          {children}
        </div>
      </div>

      <aside className="flex items-center border-t bg-card px-5 py-12 lg:border-l lg:border-t-0 lg:px-14">
        <div className="mx-auto w-full max-w-md space-y-6">
          <h2 className="text-2xl font-bold">{t("rulesTitle")}</h2>
          <dl className="border-t">
            {RULES.map((rule) => (
              <div key={rule} className="grid grid-cols-[84px_minmax(0,1fr)] gap-4 border-b py-3.5 text-sm">
                <dt className="pt-0.5 font-mono text-xs text-primary">{t(`rules.${rule}.value`)}</dt>
                <dd className="text-muted-foreground">{t(`rules.${rule}.text`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </div>
  )
}
