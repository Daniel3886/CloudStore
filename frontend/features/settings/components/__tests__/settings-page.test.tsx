import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SettingsPage } from "@/features/settings/components/settings-page"
import { authApi } from "@/features/auth/api"
import { toast } from "@/hooks/use-toast"
import { ApiError } from "@/lib/api/client"
import { renderWithIntl } from "@/test/render"

const loadUserProfile = vi.fn()
const logout = vi.fn()

vi.mock("@/features/auth/api", () => ({
  authApi: { changePassword: vi.fn(), deleteAccount: vi.fn() },
}))

vi.mock("@/features/auth/components/auth-provider", () => ({
  useAuth: () => ({
    user: { email: "jane@example.com", username: "jane", verified: true },
    loadUserProfile,
    logout,
  }),
}))

vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }) }))
vi.mock("@/i18n/actions", () => ({ setUserLocale: vi.fn() }))

async function renderPage() {
  const user = userEvent.setup()
  renderWithIntl(<SettingsPage />)
  await screen.findByRole("heading", { name: "Settings" })
  return user
}

async function fillPasswords(user: ReturnType<typeof userEvent.setup>, current: string, next: string, confirm: string) {
  await user.type(screen.getByLabelText("Current Password"), current)
  await user.type(screen.getByLabelText("New Password"), next)
  await user.type(screen.getByLabelText("Confirm New Password"), confirm)
}

beforeEach(() => {
  loadUserProfile.mockResolvedValue(null)
  vi.mocked(authApi.changePassword).mockResolvedValue(undefined)
  vi.mocked(authApi.deleteAccount).mockResolvedValue("ok")
})

describe("SettingsPage", () => {
  it("shows a loading state and then the profile", async () => {
    renderWithIntl(<SettingsPage />)
    expect(screen.getByText("Loading settings...")).toBeInTheDocument()

    expect(await screen.findByLabelText("Email Address")).toHaveValue("jane@example.com")
    expect(screen.getByLabelText("Username")).toHaveValue("jane")
    expect(loadUserProfile).toHaveBeenCalledTimes(1)
  })

  it("keeps the submit button disabled until all fields are filled", async () => {
    const user = await renderPage()
    const submit = screen.getByRole("button", { name: "Change Password" })
    expect(submit).toBeDisabled()

    await user.type(screen.getByLabelText("Current Password"), "old")
    await user.type(screen.getByLabelText("New Password"), "newpassword1")
    expect(submit).toBeDisabled()
  })

  it("keeps focus while typing and toggles visibility", async () => {
    const user = await renderPage()
    const input = screen.getByLabelText("Current Password")
    await user.type(input, "secret")
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute("type", "password")

    await user.click(screen.getAllByRole("button", { name: "Show password" })[0])
    expect(input).toHaveAttribute("type", "text")
    expect(screen.getAllByRole("button", { name: "Hide password" })).toHaveLength(1)
  })

  it("rejects mismatched passwords", async () => {
    const user = await renderPage()
    await fillPasswords(user, "oldpassword", "newpassword1", "otherpassword1")
    await user.click(screen.getByRole("button", { name: "Change Password" }))

    expect(toast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Check your new password",
      description: "Passwords do not match",
    })
    expect(authApi.changePassword).not.toHaveBeenCalled()
  })

  it.each([
    ["short1", "Password must be at least 8 characters long"],
    ["longpassword", "Password must contain at least one number"],
  ])("applies the registration password rules to %s", async (password, description) => {
    const user = await renderPage()
    await fillPasswords(user, "oldpassword", password, password)
    await user.click(screen.getByRole("button", { name: "Change Password" }))

    expect(toast).toHaveBeenCalledWith({ variant: "destructive", title: "Check your new password", description })
    expect(authApi.changePassword).not.toHaveBeenCalled()
  })

  it("changes the password and clears the form", async () => {
    const user = await renderPage()
    await fillPasswords(user, "oldpassword", "newpassword1", "newpassword1")
    await user.click(screen.getByRole("button", { name: "Change Password" }))

    expect(authApi.changePassword).toHaveBeenCalledWith("jane@example.com", "oldpassword", "newpassword1")
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        title: "Password changed",
        description: "Your password has been updated successfully",
      }),
    )
    expect(screen.getByLabelText("Current Password")).toHaveValue("")
    expect(screen.getByLabelText("New Password")).toHaveValue("")
  })

  it("shows the backend error when changing the password fails", async () => {
    vi.mocked(authApi.changePassword).mockRejectedValue(new ApiError(400, "Current password is incorrect."))
    const user = await renderPage()
    await fillPasswords(user, "wrongpassword", "newpassword1", "newpassword1")
    await user.click(screen.getByRole("button", { name: "Change Password" }))

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Failed to change password",
        description: "Your current password is incorrect.",
      }),
    )
    expect(screen.getByLabelText("Current Password")).toHaveValue("wrongpassword")
  })

  it("uses the translated fallback when the error has no message", async () => {
    vi.mocked(authApi.changePassword).mockRejectedValue("boom")
    const user = await renderPage()
    await fillPasswords(user, "oldpassword", "newpassword1", "newpassword1")
    await user.click(screen.getByRole("button", { name: "Change Password" }))

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ description: "Could not change your password" })),
    )
  })

  it("requires a password before deleting the account", async () => {
    const user = await renderPage()
    await user.click(screen.getByRole("button", { name: "Delete My Account" }))

    const dialog = await screen.findByRole("alertdialog")
    expect(within(dialog).getByText("This action cannot be undone.")).toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: "Delete Account" })).toBeDisabled()
    expect(authApi.deleteAccount).not.toHaveBeenCalled()
  })

  it("deletes the account and logs out", async () => {
    const user = await renderPage()
    await user.click(screen.getByRole("button", { name: "Delete My Account" }))
    const dialog = await screen.findByRole("alertdialog")

    await user.type(within(dialog).getByLabelText("Password"), "mypassword")
    await user.click(within(dialog).getByRole("button", { name: "Delete Account" }))

    expect(authApi.deleteAccount).toHaveBeenCalledWith("jane@example.com", "mypassword")
    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1))
    expect(toast).toHaveBeenCalledWith({
      title: "Account deleted",
      description: "Your account has been permanently deleted",
    })
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
  })

  it("does not log out when deleting the account fails", async () => {
    vi.mocked(authApi.deleteAccount).mockRejectedValue(new ApiError(401, "Invalid password."))
    const user = await renderPage()
    await user.click(screen.getByRole("button", { name: "Delete My Account" }))
    const dialog = await screen.findByRole("alertdialog")

    await user.type(within(dialog).getByLabelText("Password"), "wrong")
    await user.click(within(dialog).getByRole("button", { name: "Delete Account" }))

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Failed to delete account",
        description: "The email or password is incorrect.",
      }),
    )
    expect(logout).not.toHaveBeenCalled()
  })

  it("clears the delete password when the dialog is cancelled", async () => {
    const user = await renderPage()
    await user.click(screen.getByRole("button", { name: "Delete My Account" }))
    await user.type(within(await screen.findByRole("alertdialog")).getByLabelText("Password"), "mypassword")
    await user.click(screen.getByRole("button", { name: "Cancel" }))

    await user.click(screen.getByRole("button", { name: "Delete My Account" }))
    expect(within(await screen.findByRole("alertdialog")).getByLabelText("Password")).toHaveValue("")
  })
})
