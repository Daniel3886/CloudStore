"use client"

import { useTranslations } from "next-intl"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FolderNavigationProps {
  currentPath: string
  onBack: () => void
}

export function FolderNavigation({ currentPath, onBack }: FolderNavigationProps) {
  const t = useTranslations("files.browser")
  const crumbs = [t("root"), ...currentPath.split("/")]

  return (
    <div className="flex items-center gap-2 mb-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        {t("back")}
      </Button>
      <nav aria-label={t("breadcrumbLabel")} className="flex items-center gap-1 text-sm text-muted-foreground">
        {crumbs.map((crumb, index) => (
          <span key={index} aria-current={index === crumbs.length - 1 ? "location" : undefined}>
            {index > 0 && " / "}
            {crumb}
          </span>
        ))}
      </nav>
    </div>
  )
}
