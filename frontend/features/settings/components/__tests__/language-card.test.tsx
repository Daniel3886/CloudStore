import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { LanguageCard } from "@/features/settings/components/language-card"
import { setUserLocale } from "@/i18n/actions"
import { toast } from "@/hooks/use-toast"
import { renderWithIntl } from "@/test/render"

const refresh = vi.fn()

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh, push: vi.fn(), replace: vi.fn() }) }))
vi.mock("@/i18n/actions", () => ({ setUserLocale: vi.fn() }))
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))

describe("LanguageCard", () => {
  beforeEach(() => {
    refresh.mockReset()
    vi.mocked(setUserLocale).mockReset().mockResolvedValue(undefined)
  })

  it("shows the current language", () => {
    renderWithIntl(<LanguageCard />)

    expect(screen.getByText("Language")).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Display language" })).toHaveTextContent("English")
  })

  it("renders in Polish when the Polish locale is active", () => {
    renderWithIntl(<LanguageCard />, { locale: "pl" })

    expect(screen.getByRole("combobox", { name: "Język interfejsu" })).toHaveTextContent("Polski")
  })

  it("saves the chosen language and refreshes the page", async () => {
    const user = userEvent.setup()
    renderWithIntl(<LanguageCard />)

    await user.click(screen.getByRole("combobox", { name: "Display language" }))
    await user.click(await screen.findByRole("option", { name: "Polski" }))

    await waitFor(() => expect(setUserLocale).toHaveBeenCalledWith("pl"))
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })

  it("shows an error toast when saving fails", async () => {
    vi.mocked(setUserLocale).mockRejectedValue(new Error("Unsupported locale: xx"))
    const user = userEvent.setup()
    renderWithIntl(<LanguageCard />)

    await user.click(screen.getByRole("combobox", { name: "Display language" }))
    await user.click(await screen.findByRole("option", { name: "Polski" }))

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive", title: "Couldn't change the language" }),
      ),
    )
    expect(refresh).not.toHaveBeenCalled()
  })
})
