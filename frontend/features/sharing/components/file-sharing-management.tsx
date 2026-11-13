"use client"

import { useTranslations } from "next-intl"
import { Loader2, Share2, UserPlus, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ShareForm } from "@/features/sharing/components/share-form"
import { OwnerRow, SharedUserRow } from "@/features/sharing/components/shared-user-row"
import { useFileShares } from "@/features/sharing/hooks/use-file-shares"
import { toFileId } from "@/features/sharing/lib/share"

interface FileSharingManagementProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: {
    id?: string | number
    name: string
    s3Key?: string
    displayName?: string
  }
}

export function FileSharingManagement({ open, onOpenChange, file }: FileSharingManagementProps) {
  const t = useTranslations("sharing.management")
  const fileId = toFileId(file.id)
  const { users, isLoading, reload, revoke } = useFileShares(fileId, open)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            {t("title", { name: file.name })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                {t("shareNew")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ShareForm
                key={String(file.id)}
                fileId={fileId}
                fileName={file.displayName || file.name}
                submitIcon="mail"
                onShared={() => void reload()}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t("peopleWithAccess")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <OwnerRow />

                <Separator />

                {isLoading ? (
                  <div className="flex items-center justify-center py-8" role="status">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="sr-only">{t("loading")}</span>
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-2">
                    {users.map((email) => (
                      <SharedUserRow key={email} email={email} onRevoke={(value) => void revoke(value)} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{t("empty")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
