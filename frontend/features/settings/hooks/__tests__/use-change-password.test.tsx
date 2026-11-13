import type React from "react"
import { act, renderHook } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it, vi } from "vitest"
import { useChangePassword } from "@/features/settings/hooks/use-change-password"
import { authApi } from "@/features/auth/api"
import { toast } from "@/hooks/use-toast"
import messages from "@/messages/en"

vi.mock("@/features/auth/api", () => ({ authApi: { changePassword: vi.fn() } }))
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  )
}

describe("useChangePassword", () => {
  it("reports missing fields", async () => {
    const { result } = renderHook(() => useChangePassword("jane@example.com"), { wrapper })
    act(() => result.current.setField("currentPassword", "oldpassword"))
    expect(result.current.canSubmit).toBe(false)

    await act(() => result.current.submit())

    expect(toast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Missing fields",
      description: "Fill in all password fields",
    })
    expect(authApi.changePassword).not.toHaveBeenCalled()
  })

  it("reports a missing user email", async () => {
    const { result } = renderHook(() => useChangePassword(undefined), { wrapper })
    act(() => {
      result.current.setField("currentPassword", "oldpassword")
      result.current.setField("newPassword", "newpassword")
      result.current.setField("confirmPassword", "newpassword")
    })

    await act(() => result.current.submit())

    expect(toast).toHaveBeenCalledWith({ variant: "destructive", title: "Error", description: "User email not found" })
    expect(authApi.changePassword).not.toHaveBeenCalled()
  })
})
