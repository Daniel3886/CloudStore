"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { PublicLinksPanel } from "@/features/public-links/components/public-links-panel"
import { SharedFilesBrowser } from "@/features/sharing/components/shared-files-browser"

type SharedTab = "received" | "public-links"

const TABS: SharedTab[] = ["received", "public-links"]

function tabFromHash(hash: string): SharedTab {
  return hash === "#public-links" ? "public-links" : "received"
}

/** Files shared with you, and every public link you've made, as two tabs on one page. */
export function SharedTabs() {
  const t = useTranslations("sharing.tabs")
  const [tab, setTab] = useState<SharedTab>("received")

  useEffect(() => {
    const sync = () => setTab(tabFromHash(window.location.hash))
    sync()
    window.addEventListener("hashchange", sync)
    return () => window.removeEventListener("hashchange", sync)
  }, [])

  const select = (next: SharedTab) => {
    setTab(next)
    window.history.replaceState(null, "", next === "public-links" ? "#public-links" : window.location.pathname)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <div role="tablist" aria-label={t("title")} className="flex gap-1 border-b">
        {TABS.map((value) => (
          <button
            key={value}
            id={`shared-tab-${value}`}
            type="button"
            role="tab"
            aria-selected={tab === value}
            aria-controls={`shared-panel-${value}`}
            onClick={() => select(value)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              tab === value
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t(value === "received" ? "received" : "publicLinks")}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`shared-panel-${tab}`} aria-labelledby={`shared-tab-${tab}`}>
        {tab === "received" ? <SharedFilesBrowser /> : <PublicLinksPanel />}
      </div>
    </div>
  )
}
