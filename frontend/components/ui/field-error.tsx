"use client"

import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FieldErrorProps {
  message?: string
  className?: string
}

export function FieldError({ message, className }: FieldErrorProps) {
  if (!message) return null

  return (
    <div className={cn("flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mt-1", className)}>
      <AlertCircle className="h-3 w-3 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
