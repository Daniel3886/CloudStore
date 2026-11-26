"use client"

import { useTranslations } from "next-intl"
import { LayoutGrid, List } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FileViewMode } from "@/features/files/hooks/use-file-view-mode"

interface FileViewToggleProps {
  mode: FileViewMode
  onModeChange: (mode: FileViewMode) => void
}

export function FileViewToggle({ mode, onModeChange }: FileViewToggleProps) {
  const t = useTranslations("files.list")
  const options: { value: FileViewMode; label: string; Icon: typeof List }[] = [
    { value: "list", label: t("listView"), Icon: List },
    { value: "grid", label: t("gridView"), Icon: LayoutGrid },
  ]

  return (
    <div role="group" aria-label={t("viewLabel")} className="inline-flex rounded-md border p-0.5">
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={mode === value}
          onClick={() => onModeChange(value)}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-[5px] px-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            mode === value && "bg-muted text-foreground",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
          <span className="sr-only sm:not-sr-only">{label}</span>
        </button>
      ))}
    </div>
  )
}
