"use client"

import { useId, useState } from "react"
import { useTranslations } from "next-intl"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const RULES = ["upload", "link", "trash", "storage"] as const

/** "About this server": a closed-by-default panel under the auth form that lists the server's rules. */
export function ServerInfo() {
  const t = useTranslations("auth.shell")
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <div className="overflow-hidden rounded-lg border">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        {t("about")}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      <div id={panelId} hidden={!open} className="border-t bg-card">
        <dl className="divide-y">
          {RULES.map((rule) => (
            <div key={rule} className="grid gap-0.5 px-3 py-2.5">
              <dt className="font-display text-sm font-bold">{t(`rules.${rule}.title`)}</dt>
              <dd className="text-sm text-muted-foreground">{t(`rules.${rule}.text`)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
