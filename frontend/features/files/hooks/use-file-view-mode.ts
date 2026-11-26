"use client"

import { useCallback, useEffect, useState } from "react"

export type FileViewMode = "list" | "grid"

const STORAGE_KEY = "cloudstore:file-view"

function readStoredMode(): FileViewMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === "grid" ? "grid" : "list"
  } catch {
    return "list"
  }
}

/** List is the default; the choice is remembered in this browser. */
export function useFileViewMode() {
  const [mode, setModeState] = useState<FileViewMode>("list")

  useEffect(() => {
    setModeState(readStoredMode())
  }, [])

  const setMode = useCallback((next: FileViewMode) => {
    setModeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage can be blocked; the choice then lasts until reload.
    }
  }, [])

  return [mode, setMode] as const
}
