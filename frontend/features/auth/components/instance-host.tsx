"use client"

import { useEffect, useState } from "react"

/** The address of this CloudStore server, so people can see where they're signing in. */
export function InstanceHost({ label }: { label: string }) {
  const [host, setHost] = useState("")

  useEffect(() => {
    setHost(window.location.host)
  }, [])

  if (!host) return null

  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="size-2 rounded-full bg-primary ring-4 ring-primary/20" aria-hidden />
      <span className="sr-only">{label} </span>
      <span className="truncate">{host}</span>
    </p>
  )
}
