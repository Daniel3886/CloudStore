"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Files, Clock, Users, Trash2, Activity, Menu } from "lucide-react"

const navigation = [
  {
    name: "My Files",
    href: "/files",
    icon: Files,
  },
  {
    name: "Recent",
    href: "/recent",
    icon: Clock,
  },
  {
    name: "Shared",
    href: "/shared",
    icon: Users,
  },
  {
    name: "Activity",
    href: "/activity",
    icon: Activity,
  },
  {
    name: "Trash",
    href: "/trash",
    icon: Trash2,
  },
]

export function NavigationContent() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-2">
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 font-semibold">
        </div>
      </div>
      <nav className="flex flex-col gap-1 px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          <NavigationContent />
        </div>
      </SheetContent>
    </Sheet>
  )
}
