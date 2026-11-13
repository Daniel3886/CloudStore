"use client"

import type React from "react"
import { forwardRef, useId } from "react"
import type { LucideIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FieldError } from "@/components/ui/field-error"
import { cn } from "@/lib/utils"

export interface AuthInputProps extends Omit<React.ComponentProps<"input">, "ref"> {
  icon: LucideIcon
  error?: string
  endAdornment?: React.ReactNode
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ icon: Icon, error, endAdornment, className, id, placeholder, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`

    return (
      <div className="space-y-1">
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            ref={ref}
            id={inputId}
            placeholder={placeholder}
            aria-label={placeholder}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "pl-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary",
              endAdornment && "pr-10",
              error && "border-red-500 focus:border-red-500",
              className,
            )}
            {...props}
          />
          {endAdornment}
        </div>
        <div id={errorId}>
          <FieldError message={error} />
        </div>
      </div>
    )
  },
)
AuthInput.displayName = "AuthInput"
