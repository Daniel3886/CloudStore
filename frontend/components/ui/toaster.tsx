"use client"

import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, ...props }) => {
        const getIcon = () => {
          switch (variant) {
            case "success":
              return <CheckCircle className="h-4 w-4 text-green-600" />
            case "destructive":
              return <AlertCircle className="h-4 w-4 text-red-600" />
            case "warning":
              return <AlertTriangle className="h-4 w-4 text-yellow-600" />
            default:
              return <Info className="h-4 w-4 text-blue-600" />
          }
        }

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              {getIcon()}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
