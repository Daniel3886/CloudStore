"use client"

import { useTranslations } from "next-intl"
import { Activity, Clock, Folder, Link2, Search, Trash2, Upload, Users } from "lucide-react"
import { FileIconComponent } from "@/features/files/components/file-icons"
import type { FileType } from "@/features/files/types"

interface SampleRow {
  name: string
  type: FileType
  size: string
  modified: "items" | "today" | "yesterday" | string
  link?: boolean
}

const ROWS: SampleRow[] = [
  { name: "2025", type: "folder", size: "items", modified: "12 Nov" },
  { name: "q3-summary.pdf", type: "pdf", size: "4.1 MB", modified: "today", link: true },
  { name: "org-chart.png", type: "image", size: "812 kB", modified: "yesterday" },
  { name: "budget-2026.xlsx", type: "file", size: "1.3 MB", modified: "18 Nov" },
  { name: "meeting-notes.md", type: "document", size: "9 kB", modified: "3 Nov" },
]

/** A drawing of the file list with sample data, not the live app. */
export function ProductPreview({ linkHoursLeft }: { linkHoursLeft: number }) {
  const t = useTranslations("landing.preview")
  const nav = [
    { icon: Folder, label: t("myFiles"), active: true },
    { icon: Clock, label: "Recent" },
    { icon: Users, label: "Shared" },
    { icon: Activity, label: "Activity" },
    { icon: Trash2, label: "Trash" },
  ]

  return (
    <div className="grid min-h-[420px] grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)]" aria-hidden>
      <div className="hidden gap-1 border-r bg-card p-3 md:grid md:content-start">
        {nav.map(({ icon: Icon, label, active }) => (
          <span
            key={label}
            className={
              active
                ? "flex items-center gap-2.5 rounded-md bg-primary/15 px-2.5 py-2 text-sm font-semibold"
                : "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground"
            }
          >
            <Icon className={active ? "h-4 w-4 text-primary" : "h-4 w-4"} />
            {label}
          </span>
        ))}
      </div>
      <div className="grid content-start gap-3 p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-lg font-bold">
            <span className="text-muted-foreground">{t("myFiles")} / </span>
            {t("folder")}
          </span>
          <span className="flex-1" />
          <span className="hidden items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground sm:flex">
            <Search className="h-4 w-4" />
            {t("search")}
          </span>
          <span className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
            <Upload className="h-4 w-4" />
            {t("upload")}
          </span>
        </div>
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">{t("name")}</th>
                <th className="px-3 py-2 font-medium">{t("size")}</th>
                <th className="hidden px-3 py-2 font-medium md:table-cell">{t("modified")}</th>
                <th className="hidden px-3 py-2 font-medium md:table-cell">{t("publicLink")}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.name}
                  className={row.link ? "border-b bg-primary/10 last:border-0" : "border-b last:border-0"}
                >
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-2.5">
                      <FileIconComponent fileType={row.type} className="h-4 w-4" />
                      <span className="truncate">{row.name}</span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-muted-foreground">
                    {row.size === "items" ? t("items") : row.size}
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-2 font-mono text-xs text-muted-foreground md:table-cell">
                    {row.modified === "today"
                      ? t("today")
                      : row.modified === "yesterday"
                        ? t("yesterday")
                        : row.modified}
                  </td>
                  <td className="hidden px-3 py-2 md:table-cell">
                    {row.link ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
                        <Link2 className="h-3 w-3" />
                        {t("hoursLeft", { hours: linkHoursLeft })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
