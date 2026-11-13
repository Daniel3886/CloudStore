import type React from "react"
import { Loader2 } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean
}

export function LoadingButton({ isLoading = false, disabled, children, ...props }: LoadingButtonProps) {
  return (
    <Button disabled={disabled || isLoading} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </Button>
  )
}

export function SubmitButton({
  children,
  ...props
}: Omit<LoadingButtonProps, "type" | "className"> & { children: React.ReactNode }) {
  return (
    <LoadingButton type="submit" className="w-full h-12 text-base font-medium" {...props}>
      {children}
    </LoadingButton>
  )
}
