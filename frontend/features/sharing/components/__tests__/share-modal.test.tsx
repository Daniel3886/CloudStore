import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithIntl } from "@/test/render"
import { toast } from "@/hooks/use-toast"
import { sharingApi } from "@/features/sharing/api"
import { ShareModal } from "@/features/sharing/components/share-modal"
import { ApiError } from "@/lib/api/client"

vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))
vi.mock("@/features/sharing/api", () => ({ sharingApi: { shareFile: vi.fn() } }))
vi.mock("@/features/public-links/components/public-links-manager", () => ({ PublicLinksManager: () => null }))

const file = { id: 7, name: "report.pdf", displayName: "docs/report.pdf" }

describe("ShareModal", () => {
  beforeEach(() => {
    vi.mocked(sharingApi.shareFile).mockResolvedValue()
  })

  it("rejects an invalid email without calling the API", async () => {
    const user = userEvent.setup()
    renderWithIntl(<ShareModal open onOpenChange={vi.fn()} file={file} />)

    expect(screen.getByRole("heading", { name: 'Share "docs/report.pdf"' })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Share File" })).toBeDisabled()

    await user.type(screen.getByLabelText("Email address"), "not-an-email")
    await user.click(screen.getByRole("button", { name: "Share File" }))

    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument()
    expect(sharingApi.shareFile).not.toHaveBeenCalled()
  })

  it("shares the file with the email and message, then clears the form", async () => {
    const user = userEvent.setup()
    renderWithIntl(<ShareModal open onOpenChange={vi.fn()} file={file} />)

    await user.type(screen.getByLabelText("Email address"), " ana@example.com ")
    await user.type(screen.getByLabelText("Message (optional)"), "Have a look")
    await user.click(screen.getByRole("button", { name: "Share File" }))

    expect(sharingApi.shareFile).toHaveBeenCalledWith({
      fileId: 7,
      targetUserEmail: "ana@example.com",
      message: "Have a look",
    })
    await waitFor(() => expect(screen.getByLabelText("Email address")).toHaveValue(""))
    expect(toast).toHaveBeenCalledWith({
      title: "File shared successfully",
      description: '"docs/report.pdf" has been shared with ana@example.com',
    })
  })

  it("shows the backend error when sharing fails", async () => {
    vi.mocked(sharingApi.shareFile).mockRejectedValue(new ApiError(400, "Recipient not found"))
    const user = userEvent.setup()
    renderWithIntl(<ShareModal open onOpenChange={vi.fn()} file={file} />)

    await user.type(screen.getByLabelText("Email address"), "ana@example.com{Enter}")

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Failed to share file",
        description: "No CloudStore user has this email address.",
      }),
    )
    expect(screen.getByLabelText("Email address")).toHaveValue("ana@example.com")
  })

  it("disables sharing when the file has no usable id", () => {
    renderWithIntl(<ShareModal open onOpenChange={vi.fn()} file={{ name: "folder" }} />)

    expect(screen.getByText(/can't be shared right now/)).toBeInTheDocument()
    expect(screen.getByLabelText("Email address")).toBeDisabled()
  })
})
