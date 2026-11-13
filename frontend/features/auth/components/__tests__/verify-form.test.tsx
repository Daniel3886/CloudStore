import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { authApi } from "@/features/auth/api"
import { VerifyForm } from "@/features/auth/components/verify-form"
import { toast } from "@/hooks/use-toast"
import { renderWithIntl } from "@/test/render"

const mocks = vi.hoisted(() => ({ router: { push: vi.fn(), replace: vi.fn() }, login: vi.fn() }))

vi.mock("next/navigation", () => ({ useRouter: () => mocks.router }))
vi.mock("@/features/auth/components/auth-provider", () => ({ useAuth: () => ({ login: mocks.login }) }))
vi.mock("@/features/auth/api", () => ({ authApi: { verifyAccount: vi.fn(), resendVerificationCode: vi.fn() } }))
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))

describe("VerifyForm", () => {
  beforeEach(() => {
    mocks.login.mockResolvedValue(undefined)
  })

  it("uses the stored registration email and logs in with the returned token", async () => {
    sessionStorage.setItem("pendingVerificationEmail", "jane@example.com")
    vi.mocked(authApi.verifyAccount).mockResolvedValue("access-token")
    const user = userEvent.setup()
    renderWithIntl(<VerifyForm />)

    expect(await screen.findByText("jane@example.com")).toBeInTheDocument()
    expect(screen.queryByPlaceholderText("Email address")).not.toBeInTheDocument()

    await user.type(screen.getByPlaceholderText("Enter 6-digit code"), "123456")
    await user.click(screen.getByRole("button", { name: "Verify Email" }))

    expect(authApi.verifyAccount).toHaveBeenCalledWith("jane@example.com", "123456")
    expect(mocks.login).toHaveBeenCalledWith("access-token")
    expect(sessionStorage.getItem("pendingVerificationEmail")).toBeNull()
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Email verified!" }))
    expect(mocks.router.push).toHaveBeenCalledWith("/files")
  })

  it("keeps the email field visible while typing when nothing is stored", async () => {
    const user = userEvent.setup()
    renderWithIntl(<VerifyForm />)

    await user.type(screen.getByPlaceholderText("Email address"), "jane@example.com")
    await user.type(screen.getByPlaceholderText("Enter 6-digit code"), "123")
    await user.click(screen.getByRole("button", { name: "Verify Email" }))

    expect(screen.getByPlaceholderText("Email address")).toHaveValue("jane@example.com")
    expect(screen.getByText("Verification code must be 6 digits")).toBeInTheDocument()
    expect(authApi.verifyAccount).not.toHaveBeenCalled()
  })

  it("validates the email before resending a code", async () => {
    const user = userEvent.setup()
    renderWithIntl(<VerifyForm />)

    await user.click(screen.getByRole("button", { name: "Resend code" }))

    expect(screen.getByText("Email is required")).toBeInTheDocument()
    expect(authApi.resendVerificationCode).not.toHaveBeenCalled()
  })

  it("resends the code and starts the countdown", async () => {
    sessionStorage.setItem("pendingVerificationEmail", "jane@example.com")
    vi.mocked(authApi.resendVerificationCode).mockResolvedValue("sent")
    const user = userEvent.setup()
    renderWithIntl(<VerifyForm />)

    await screen.findByText("jane@example.com")
    await user.click(screen.getByRole("button", { name: "Resend code" }))

    expect(authApi.resendVerificationCode).toHaveBeenCalledWith("jane@example.com")
    expect(await screen.findByRole("button", { name: "Resend in 60s" })).toBeDisabled()
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Code sent!" }))
  })

  it("shows the fallback message when verification fails", async () => {
    sessionStorage.setItem("pendingVerificationEmail", "jane@example.com")
    vi.mocked(authApi.verifyAccount).mockRejectedValue(undefined)
    const user = userEvent.setup()
    renderWithIntl(<VerifyForm />)

    await user.type(screen.getByPlaceholderText("Enter 6-digit code"), "123456")
    await user.click(screen.getByRole("button", { name: "Verify Email" }))

    expect(
      await screen.findByText("Unable to verify code. Please check your connection and try again."),
    ).toBeInTheDocument()
    expect(mocks.login).not.toHaveBeenCalled()
  })
})
