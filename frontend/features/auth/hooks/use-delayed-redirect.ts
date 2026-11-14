import { useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export function useDelayedRedirect() {
  const router = useRouter()
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const cancel = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = undefined
  }, [])

  const schedule = useCallback(
    (href: string, delayMs: number) => {
      cancel()
      timer.current = setTimeout(() => router.push(href), delayMs)
    },
    [router, cancel],
  )

  useEffect(() => cancel, [cancel])

  return { schedule, cancel }
}
