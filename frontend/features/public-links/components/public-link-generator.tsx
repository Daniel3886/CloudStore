"use client"

import { useId } from "react"
import { useTranslations } from "next-intl"
import { Clock, Download, Eye, Globe, Link, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { PublicLinkField } from "@/features/public-links/components/public-link-field"
import { useFormatFileSize } from "@/hooks/use-format-file-size"
import { useGeneratePublicLink } from "@/features/public-links/hooks/use-generate-public-link"

interface PublicLinkGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: {
    id: number
    name: string
    displayName?: string
    size?: number
  }
}

export function PublicLinkGenerator({ open, onOpenChange, file }: PublicLinkGeneratorProps) {
  const t = useTranslations("publicLinks.generator")
  const formatFileSize = useFormatFileSize()
  const { result, isGenerating, generate, reset } = useGeneratePublicLink(file.id)
  const fieldId = useId()

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Link className="h-4 w-4" />
                {file.displayName || file.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{t("size", { size: file.size ? formatFileSize(file.size) : t("unknownSize") })}</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {t("expiryBadge")}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {!result ? (
            <div className="text-center py-6">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t("createTitle")}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t("createDescription")}</p>
              <Button onClick={() => void generate()} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("generating")}
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    {t("generate")}
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium mb-2">{t("successTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("successDescription")}</p>
              </div>

              <Separator />

              <PublicLinkField
                id={`${fieldId}-download`}
                kind="download"
                link={result.downloadLink}
                label={t("downloadLink")}
                icon={<Download className="h-4 w-4" />}
                openIcon={<Download className="h-4 w-4" />}
              />

              {result.previewLink && (
                <PublicLinkField
                  id={`${fieldId}-preview`}
                  kind="preview"
                  link={result.previewLink}
                  label={t("previewLink")}
                  icon={<Eye className="h-4 w-4" />}
                  openIcon={<Eye className="h-4 w-4" />}
                />
              )}

              {result.message && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-800">{result.message}</p>
                </div>
              )}

              <Button variant="outline" onClick={reset} className="w-full">
                {t("generateAnother")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
