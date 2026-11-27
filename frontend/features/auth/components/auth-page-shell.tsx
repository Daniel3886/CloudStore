import type React from "react"
import { getTranslations } from "next-intl/server"
import { InstanceHost } from "@/features/auth/components/instance-host"
import { ServerInfo } from "@/features/auth/components/server-info"

interface AuthPageShellProps {
  title: string
  children: React.ReactNode
}

export async function AuthPageShell({ title, children }: AuthPageShellProps) {
  const t = await getTranslations("auth.shell")
  const tCommon = await getTranslations("common")

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
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
        <ServerInfo />
      </div>
    </div>
  )
}
