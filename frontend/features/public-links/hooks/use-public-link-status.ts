"use client"

import { useCallback, useEffect, useState } from "react"
import { publicLinksApi, type PublicFileAccessToken } from "@/features/public-links/api"

/** Active, unexpired public links keyed by file id. Keeps the latest-expiring link per file. */
export function indexActiveLinks(links: PublicFileAccessToken[], now: number = Date.now()) {
  const byFile = new Map<number, PublicFileAccessToken>()
  for (const link of links) {
    if (!link.active || !(Date.parse(link.expiresAt) > now)) continue
    const existing = byFile.get(link.file.id)
    if (!existing || Date.parse(link.expiresAt) > Date.parse(existing.expiresAt)) byFile.set(link.file.id, link)
  }
  return byFile
}

/**
 * Loads which files currently have a public link so the file list can show it.
 * The badge is extra information, so a failed request just leaves the badges off.
 */
export function usePublicLinkStatus(enabled: boolean, refreshSignal = 0) {
  const [links, setLinks] = useState<Map<number, PublicFileAccessToken>>(() => new Map())

  const load = useCallback(async (isCancelled: () => boolean) => {
    try {
      const data = await publicLinksApi.getActiveLinks()
      if (!isCancelled()) setLinks(indexActiveLinks(Array.isArray(data) ? data : []))
    } catch {
      if (!isCancelled()) setLinks(new Map())
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    void load(() => cancelled)
    return () => {
      cancelled = true
    }
  }, [enabled, load, refreshSignal])

  return links
}
