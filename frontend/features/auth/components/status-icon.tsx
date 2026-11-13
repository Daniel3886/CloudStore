import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const variants = {
  primary: { circle: "bg-primary/10", icon: "text-primary" },
  success: { circle: "bg-green-100 dark:bg-green-900", icon: "text-green-600 dark:text-green-400" },
  danger: { circle: "bg-red-100 dark:bg-red-900", icon: "text-red-600 dark:text-red-400" },
}

interface StatusIconProps {
  icon: LucideIcon
  variant?: keyof typeof variants
}

export function StatusIcon({ icon: Icon, variant = "primary" }: StatusIconProps) {
  const styles = variants[variant]

  return (
    <div className="flex items-center justify-center">
      <div className={cn("size-16 rounded-full flex items-center justify-center", styles.circle)}>
        <Icon className={cn("h-8 w-8", styles.icon)} aria-hidden />
      </div>
    </div>
  )
}
