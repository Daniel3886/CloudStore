import { useCallback, useState } from "react"
import { useCountdown } from "@/features/auth/hooks/use-countdown"

export const RESEND_COOLDOWN_SECONDS = 60

export function useResendCode(resend: () => Promise<void>, cooldownSeconds = RESEND_COOLDOWN_SECONDS) {
  const [isResending, setIsResending] = useState(false)
  const { secondsLeft, isRunning, start } = useCountdown()

  const trigger = useCallback(async () => {
    setIsResending(true)
    try {
      await resend()
      start(cooldownSeconds)
    } finally {
      setIsResending(false)
    }
  }, [resend, start, cooldownSeconds])

  return { resend: trigger, isResending, secondsLeft, canResend: !isResending && !isRunning }
}
