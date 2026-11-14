"use client"

import type React from "react"
import { useTranslations } from "next-intl"
import { Copy } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { copyToClipboard, type LinkKind } from "@/features/public-links/lib/links"

interface CopyLinkButtonProps {
  link: string
  kind: LinkKind
  size?: ButtonProps["size"]
  icon?: React.ReactNode
}

export function CopyLinkButton({ link, kind, size = "sm", icon }: CopyLinkButtonProps) {
  const t = useTranslations("publicLinks")
  const label = kind === "preview" ? t("actions.copyPreview") : t("actions.copyDownload")

  const handleCopy = async () => {
    if (await copyToClipboard(link)) {
      toast({ title: t("toast.copied.title"), description: t(`toast.copied.${kind}`) })
    } else {
      toast({
        variant: "destructive",
        title: t("toast.copyFailed.title"),
        description: t("toast.copyFailed.description"),
      })
    }
  }

  return (
    <Button variant="outline" size={size} onClick={handleCopy} title={label} aria-label={label}>
      {icon ?? <Copy className="h-4 w-4" />}
    </Button>
  )
}
