import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { renderWithIntl } from "@/test/render"
import { ServerInfo } from "@/features/auth/components/server-info"

describe("ServerInfo", () => {
  it("starts closed and opens and closes the server rules in place", async () => {
    const user = userEvent.setup()
    renderWithIntl(<ServerInfo />)

    const toggle = screen.getByRole("button", { name: "About this server" })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByText("Up to 5 MB each")).not.toBeVisible()

    await user.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("Up to 5 MB each")).toBeVisible()
    expect(screen.getByText("Stops working 24 hours after you create it")).toBeVisible()
    expect(screen.getByText("Files stay 30 days, then they're deleted for good")).toBeVisible()
    expect(screen.getByText("Files are kept in this server owner's S3 bucket")).toBeVisible()

    await user.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByText("Up to 5 MB each")).not.toBeVisible()
  })

  it("is translated", () => {
    renderWithIntl(<ServerInfo />, { locale: "pl" })
    expect(screen.getByRole("button", { name: "O tym serwerze" })).toBeInTheDocument()
  })
})
