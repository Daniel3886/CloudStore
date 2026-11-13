import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithIntl } from "@/test/render"
import { sharingApi } from "@/features/sharing/api"
import { FileSharingManagement } from "@/features/sharing/components/file-sharing-management"

vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))
vi.mock("@/features/sharing/api", () => ({
  sharingApi: { shareFile: vi.fn(), getFileSharedUsers: vi.fn(), revokeAccess: vi.fn() },
}))

const file = { id: "12", name: "report.pdf", s3Key: "k" }

describe("FileSharingManagement", () => {
  beforeEach(() => {
    vi.mocked(sharingApi.getFileSharedUsers).mockResolvedValue(["ana@example.com", "bob@example.com"])
    vi.mocked(sharingApi.revokeAccess).mockResolvedValue()
    vi.mocked(sharingApi.shareFile).mockResolvedValue()
  })

  it("loads the people with access using the file id", async () => {
    renderWithIntl(<FileSharingManagement open onOpenChange={vi.fn()} file={file} />)

    expect(await screen.findByText("ana@example.com")).toBeInTheDocument()
    expect(screen.getByText("bob@example.com")).toBeInTheDocument()
    expect(screen.getByText("You (Owner)")).toBeInTheDocument()
    expect(sharingApi.getFileSharedUsers).toHaveBeenCalledWith(12)
  })

  it("revokes access for a user", async () => {
    const user = userEvent.setup()
    renderWithIntl(<FileSharingManagement open onOpenChange={vi.fn()} file={file} />)

    await user.click(await screen.findByRole("button", { name: "Revoke access for ana@example.com" }))

    expect(sharingApi.revokeAccess).toHaveBeenCalledWith(12, "ana@example.com")
    await waitFor(() => expect(screen.queryByText("ana@example.com")).not.toBeInTheDocument())
    expect(screen.getByText("bob@example.com")).toBeInTheDocument()
  })

  it("reloads the list after sharing", async () => {
    const user = userEvent.setup()
    renderWithIntl(<FileSharingManagement open onOpenChange={vi.fn()} file={file} />)
    await screen.findByText("ana@example.com")

    await user.type(screen.getByLabelText("Email address"), "cy@example.com")
    await user.click(screen.getByRole("button", { name: "Share File" }))

    expect(sharingApi.shareFile).toHaveBeenCalledWith({ fileId: 12, targetUserEmail: "cy@example.com" })
    await waitFor(() => expect(sharingApi.getFileSharedUsers).toHaveBeenCalledTimes(2))
  })

  it("shows the empty state", async () => {
    vi.mocked(sharingApi.getFileSharedUsers).mockResolvedValue([])
    renderWithIntl(<FileSharingManagement open onOpenChange={vi.fn()} file={file} />)

    expect(await screen.findByText("No one else has access to this file")).toBeInTheDocument()
  })
})
