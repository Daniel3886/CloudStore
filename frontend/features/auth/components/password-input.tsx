"use client"

import { forwardRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthInput, type AuthInputProps } from "@/features/auth/components/auth-input"

export type PasswordInputProps = Omit<AuthInputProps, "icon" | "type" | "endAdornment">

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const t = useTranslations("auth.fields")
  const [isVisible, setIsVisible] = useState(false)
  const VisibilityIcon = isVisible ? EyeOff : Eye

  return (
    <AuthInput
      ref={ref}
      icon={Lock}
      type={isVisible ? "text" : "password"}
      endAdornment={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          aria-label={isVisible ? t("hidePassword") : t("showPassword")}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((visible) => !visible)}
        >
          <VisibilityIcon className="h-4 w-4" aria-hidden />
        </Button>
      }
      {...props}
    />
  )
})
PasswordInput.displayName = "PasswordInput"
