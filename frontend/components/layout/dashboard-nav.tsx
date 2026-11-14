"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet"
import { Files, Clock, Users, Trash2, Activity, Menu } from "lucide-react"

const navigation = [
  { key: "files", href: "/files", icon: Files },
  { key: "recent", href: "/recent", icon: Clock },
  { key: "shared", href: "/shared", icon: Users },
  { key: "activity", href: "/activity", icon: Activity },
  { key: "trash", href: "/trash", icon: Trash2 },
] as const

export function NavigationContent() {
  const pathname = usePathname()
  const t = useTranslations("common.nav")

  return (
    <div className="flex flex-col gap-2">
      <nav className="flex flex-col gap-1 px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.key)}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function DashboardNav() {
  return (
    <aside className="hidden w-64 border-r bg-muted/10 md:block">
      <div className="flex h-full flex-col">
        <NavigationContent />
      </div>
    </aside>
  )
}

export function MobileNavTrigger() {
  const [open, setOpen] = useState(false)
  const t = useTranslations("common.nav")

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("openMenu")}>
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 pt-3">
        <SheetHeader className="px-4 pb-3 border-b">
          <SheetTitle className="text-xl font-bold tracking-tight text-foreground">{t("menuTitle")}</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col">
          <NavigationContent />
        </div>
      </SheetContent>
    </Sheet>
  )
}
