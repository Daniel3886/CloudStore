import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { authApi } from "@/features/auth/api"
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form"
import { renderWithIntl } from "@/test/render"

const mocks = vi.hoisted(() => ({ router: { push: vi.fn(), replace: vi.fn() } }))

vi.mock("next/navigation", () => ({ useRouter: () => mocks.router }))
vi.mock("@/features/auth/api", () => ({ authApi: { requestPasswordReset: vi.fn() } }))
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
  vi.useRealTimers()
})

async function submitEmail(email: string) {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  if (email) await user.type(screen.getByPlaceholderText("Email address"), email)
  await user.click(screen.getByRole("button", { name: "Send verification code" }))
  return user
}

describe("ForgotPasswordForm", () => {
  it("validates the email", async () => {
    renderWithIntl(<ForgotPasswordForm />)

    await submitEmail("")

    expect(screen.getByText("Email is required")).toBeInTheDocument()
    expect(authApi.requestPasswordReset).not.toHaveBeenCalled()
  })

  it("starts the reset flow and redirects to the verification page", async () => {
    vi.mocked(authApi.requestPasswordReset).mockResolvedValue("sent")
    renderWithIntl(<ForgotPasswordForm />)

    await submitEmail("jane@example.com")

    expect(await screen.findByText("Check your email")).toBeInTheDocument()
    expect(sessionStorage.getItem("passwordResetEmail")).toBe("jane@example.com")
    expect(sessionStorage.getItem("resetFlowActive")).toBe("true")

    act(() => vi.advanceTimersByTime(2000))
    expect(mocks.router.push).toHaveBeenCalledWith("/verify-password")
  })

  it("cancels the pending redirect when trying another email", async () => {
    vi.mocked(authApi.requestPasswordReset).mockResolvedValue("sent")
    renderWithIntl(<ForgotPasswordForm />)

    const user = await submitEmail("jane@example.com")
    await user.click(await screen.findByRole("button", { name: "Try another email" }))

    act(() => vi.advanceTimersByTime(5000))
    expect(mocks.router.push).not.toHaveBeenCalled()
    expect(screen.getByPlaceholderText("Email address")).toHaveValue("jane@example.com")
  })
})
