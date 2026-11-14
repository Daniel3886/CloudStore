"use client"

import { useTranslations } from "next-intl"

export function CloseLabel() {
  const t = useTranslations("common")
  return <span className="sr-only">{t("close")}</span>
}
