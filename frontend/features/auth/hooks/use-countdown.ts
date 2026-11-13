import { useCallback, useEffect, useState } from "react"

export function useCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  const start = useCallback((seconds: number) => setSecondsLeft(seconds), [])

  return { secondsLeft, isRunning: secondsLeft > 0, start }
}
