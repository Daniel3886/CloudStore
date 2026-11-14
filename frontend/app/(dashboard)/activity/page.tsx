import { getTranslations } from "next-intl/server"
import { AuditLogBrowser } from "@/features/activity/components/audit-log-browser"

export default async function ActivityPage() {
  const t = await getTranslations("activity.page")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <AuditLogBrowser />
    </div>
  )
}
