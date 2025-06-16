"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Clock, FileIcon, FolderIcon, Share2, Star, Trash2, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const navItems = [
  {
    title: "Files",
    href: "/files",
    icon: FolderIcon,
  },
  {
    title: "Shared with me",
    href: "/shared",
    icon: Share2,
  },
  {
    title: "Recent",
    href: "/recent",
    icon: Clock,
  },
  {
    title: "Starred",
    href: "/starred",
    icon: Star,
  },
  {
    title: "Trash",
    href: "/trash",
    icon: Trash2,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden border-r bg-background md:block w-64">
      <div className="flex h-full flex-col gap-2 p-4">
        <Button className="justify-start gap-2 mb-6" size="lg">
          <FileIcon className="h-4 w-4" />
          New Upload
        </Button>
        <ScrollArea className="flex-1">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-2", pathname === item.href && "bg-secondary")}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
          <div className="mt-6 space-y-1">
            <h3 className="px-4 text-sm font-medium text-muted-foreground">Teams</h3>
            <Button variant="ghost" className="w-full justify-start gap-2" asChild>
              <Link href="/teams/engineering">
                <Users className="h-4 w-4" />
                Engineering
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2" asChild>
              <Link href="/teams/design">
                <Users className="h-4 w-4" />
                Design
              </Link>
            </Button>
          </div>
        </ScrollArea>
        <div className="mt-auto">
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-md bg-primary/10 grid place-items-center">
                <FileIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Storage</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <div className="h-2 w-full rounded-full bg-muted-foreground/20">
                    <div className="h-full w-1/3 rounded-full bg-primary" />
                  </div>
                  <span className="ml-2">32%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
