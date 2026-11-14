import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { PasswordInput } from "@/features/auth/components/password-input"
import { renderWithIntl } from "@/test/render"

describe("PasswordInput", () => {
  it("toggles password visibility with an accessible button", async () => {
    const user = userEvent.setup()
    renderWithIntl(<PasswordInput placeholder="Password" error="Password is required" />)

    const input = screen.getByPlaceholderText("Password")
    expect(input).toHaveAttribute("type", "password")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveAccessibleDescription("Password is required")

    await user.click(screen.getByRole("button", { name: "Show password" }))
    expect(input).toHaveAttribute("type", "text")

    await user.click(screen.getByRole("button", { name: "Hide password" }))
    expect(input).toHaveAttribute("type", "password")
  })
})
