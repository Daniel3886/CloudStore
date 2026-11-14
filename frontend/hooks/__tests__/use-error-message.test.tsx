import { renderHook } from "@testing-library/react"
import type React from "react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it } from "vitest"
import { useErrorMessage } from "@/hooks/use-error-message"
import { ApiError } from "@/lib/api/client"
import pl from "@/messages/pl"

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="pl" messages={pl} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  )
}

describe("useErrorMessage", () => {
  it("translates known API errors and uses the fallback for everything else", () => {
    const { result } = renderHook(() => useErrorMessage(), { wrapper })
    const errorMessage = result.current

    expect(errorMessage(new ApiError(400, "Email already in use."), "fallback")).toBe(
      "Konto z tym adresem e-mail już istnieje.",
    )
    expect(errorMessage(new ApiError(500, "Rename failed: S3 timeout"), "fallback")).toBe("fallback")
    expect(errorMessage(new Error("Some English text"), "fallback")).toBe("fallback")
  })
})
