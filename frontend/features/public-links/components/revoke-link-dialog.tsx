"use client"

import { useTranslations } from "next-intl"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { PublicFileAccessToken } from "@/features/public-links/api"

interface RevokeLinkDialogProps {
  link: PublicFileAccessToken | null
  onCancel: () => void
  onConfirm: (link: PublicFileAccessToken) => void
}

export function RevokeLinkDialog({ link, onCancel, onConfirm }: RevokeLinkDialogProps) {
  const t = useTranslations("publicLinks.revokeDialog")

  return (
    <AlertDialog open={link !== null} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description", { name: link?.file.displayName ?? "" })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={() => link && onConfirm(link)} className="bg-red-600 hover:bg-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
