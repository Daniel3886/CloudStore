"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Check, Copy } from "lucide-react"
import { copyToClipboard } from "@/features/public-links/lib/links"
import { cn } from "@/lib/utils"

export function CopyCommand({ command, className }: { command: string; className?: string }) {
  const t = useTranslations("landing.copy")
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle")
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const handleCopy = async () => {
    setState((await copyToClipboard(command)) ? "copied" : "failed")
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState("idle"), 1800)
  }

  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-3 rounded-lg border bg-slate-950 py-1.5 pl-4 pr-1.5 font-mono text-sm text-slate-200",
        className,
      )}
    >
      <code className="truncate">
        <span className="text-blue-400">$</span> {command}
      </code>
      <button
        type="button"
        onClick={() => void handleCopy()}
        aria-label={t("label")}
        className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-sans text-xs text-slate-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {state === "copied" ? (
          <Check className="h-3.5 w-3.5 text-green-400" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden />
        )}
        <span aria-live="polite">
          {state === "copied" ? t("copied") : state === "failed" ? t("failed") : t("copy")}
        </span>
      </button>
    </div>
  )
}
