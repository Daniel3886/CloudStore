"use client"

import type React from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CopyLinkButton } from "@/features/public-links/components/copy-link-button"
import { openInNewTab, type LinkKind } from "@/features/public-links/lib/links"

interface PublicLinkFieldProps {
  id: string
  kind: LinkKind
  link: string
  label: string
  icon: React.ReactNode
  openIcon: React.ReactNode
}

export function PublicLinkField({ id, kind, link, label, icon, openIcon }: PublicLinkFieldProps) {
  const t = useTranslations("publicLinks.actions")
  const openLabel = kind === "preview" ? t("openPreview") : t("openDownload")

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <div className="flex gap-2">
        <Input id={id} value={link} readOnly className="font-mono text-xs" />
        <CopyLinkButton link={link} kind={kind} size="icon" />
        <Button
          variant="outline"
          size="icon"
          onClick={() => openInNewTab(link)}
          title={openLabel}
          aria-label={openLabel}
        >
          {openIcon}
        </Button>
      </div>
    </div>
  )
}
