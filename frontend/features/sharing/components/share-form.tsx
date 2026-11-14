"use client"

import { useId } from "react"
import { useTranslations } from "next-intl"
import { Loader2, Mail, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field-error"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useShareFile } from "@/features/sharing/hooks/use-share-file"

interface ShareFormProps {
  fileId: number | null
  fileName: string
  submitIcon?: "send" | "mail"
  onShared?: () => void
}

export function ShareForm({ fileId, fileName, submitIcon = "send", onShared }: ShareFormProps) {
  const t = useTranslations("sharing.form")
  const { email, message, emailError, isSharing, setEmail, setMessage, share } = useShareFile({
    fileId,
    fileName,
    onShared,
  })
  const id = useId()
  const disabled = isSharing || fileId === null
  const SubmitIcon = submitIcon === "mail" ? Mail : Send

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void share()
      }}
    >
      {fileId === null && <FieldError message={t("missingFileId")} />}

      <div className="space-y-2">
        <Label htmlFor={`${id}-email`}>{t("emailLabel")}</Label>
        <Input
          id={`${id}-email`}
          placeholder={t("emailPlaceholder")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={disabled}
          aria-invalid={emailError ? true : undefined}
        />
        <FieldError message={emailError} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${id}-message`}>{t("messageLabel")}</Label>
        <Textarea
          id={`${id}-message`}
          placeholder={t("messagePlaceholder")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
          rows={2}
        />
      </div>

      <Button type="submit" disabled={!email.trim() || disabled} className="w-full">
        {isSharing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t("submitting")}
          </>
        ) : (
          <>
            <SubmitIcon className="h-4 w-4 mr-2" />
            {t("submit")}
          </>
        )}
      </Button>
    </form>
  )
}
