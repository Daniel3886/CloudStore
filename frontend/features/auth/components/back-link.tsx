import type React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BackLinkProps {
  href: string
  children: React.ReactNode
}

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <div className="text-center">
      <Button variant="ghost" asChild className="h-auto p-0">
        <Link href={href} className="text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-1 h-3 w-3" aria-hidden />
          {children}
        </Link>
      </Button>
    </div>
  )
}
