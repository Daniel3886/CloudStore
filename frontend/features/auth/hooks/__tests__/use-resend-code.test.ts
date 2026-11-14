import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCountdown } from "@/features/auth/hooks/use-countdown"
import { useResendCode } from "@/features/auth/hooks/use-resend-code"

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("useCountdown", () => {
  it("counts down once per second and stops at zero", () => {
    const { result } = renderHook(() => useCountdown())
    expect(result.current.isRunning).toBe(false)

    act(() => result.current.start(2))
    expect(result.current.secondsLeft).toBe(2)

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.secondsLeft).toBe(1)

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.secondsLeft).toBe(0)
    expect(result.current.isRunning).toBe(false)

    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.secondsLeft).toBe(0)
  })
})

describe("useResendCode", () => {
  it("starts the cooldown after a successful resend", async () => {
    const resend = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useResendCode(resend, 3))

    expect(result.current.canResend).toBe(true)

    await act(() => result.current.resend())

    expect(resend).toHaveBeenCalledTimes(1)
    expect(result.current.secondsLeft).toBe(3)
    expect(result.current.canResend).toBe(false)

    for (let second = 0; second < 3; second++) {
      act(() => vi.advanceTimersByTime(1000))
    }
    expect(result.current.canResend).toBe(true)
  })

  it("rethrows failures without starting the cooldown", async () => {
    const resend = vi.fn().mockRejectedValue(new Error("boom"))
    const { result } = renderHook(() => useResendCode(resend))

    await act(() => expect(result.current.resend()).rejects.toThrow("boom"))

    expect(result.current.secondsLeft).toBe(0)
    expect(result.current.isResending).toBe(false)
    expect(result.current.canResend).toBe(true)
  })
})
