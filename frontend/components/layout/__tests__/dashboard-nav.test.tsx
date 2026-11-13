import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { NavigationContent } from "@/components/layout/dashboard-nav"
import { renderWithIntl } from "@/test/render"

vi.mock("next/navigation", () => ({ usePathname: () => "/shared" }))

describe("NavigationContent", () => {
  it("renders translated links and marks the current page", () => {
    renderWithIntl(<NavigationContent />)

    expect(screen.getByRole("link", { name: "My Files" })).toHaveAttribute("href", "/files")
    expect(screen.getByRole("link", { name: "Trash" })).toHaveAttribute("href", "/trash")
    expect(screen.getByRole("link", { name: "Shared" })).toHaveClass("bg-primary")
    expect(screen.getByRole("link", { name: "Recent" })).not.toHaveClass("bg-primary")
  })
})
