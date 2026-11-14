import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithIntl } from "@/test/render"
import { toast } from "@/hooks/use-toast"
import { filesApi } from "@/features/files/api"
import { UploadModal } from "@/features/files/components/upload-modal"
import { ApiError } from "@/lib/api/client"

vi.mock("@/features/files/api", () => ({ filesApi: { upload: vi.fn() } }))
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))

const upload = vi.mocked(filesApi.upload)
const makeFile = (name: string) => new File(["hello"], name, { type: "text/plain" })

function renderModal(props: Partial<React.ComponentProps<typeof UploadModal>> = {}) {
  const onUploadComplete = vi.fn()
  const onOpenChange = vi.fn()
  renderWithIntl(
    <UploadModal open onOpenChange={onOpenChange} onUploadComplete={onUploadComplete} currentPath="docs" {...props} />,
  )
  return { onUploadComplete, onOpenChange }
}

describe("UploadModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows the empty dropzone and a disabled upload button", () => {
    renderModal()
    expect(screen.getByRole("heading", { name: "Upload files" })).toBeInTheDocument()
    expect(screen.getByText("Drag and drop files here or click to browse")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Upload 0 files" })).toBeDisabled()
  })

  it("lists selected files and lets the user remove one", async () => {
    const user = userEvent.setup()
    renderModal()

    await user.upload(screen.getByTestId("upload-input"), [makeFile("a.txt"), makeFile("b.txt")])

    expect(screen.getByText("2 files selected (2 pending)")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Remove a.txt" }))
    expect(screen.queryByText("a.txt")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Upload 1 file" })).toBeEnabled()
  })

  it("uploads files into the current folder and reports success", async () => {
    upload.mockResolvedValue("ok")
    const user = userEvent.setup()
    const { onUploadComplete } = renderModal()

    await user.upload(screen.getByTestId("upload-input"), makeFile("a.txt"))
    await user.click(screen.getByRole("button", { name: "Upload 1 file" }))

    expect(await screen.findByText("All files uploaded successfully!")).toBeInTheDocument()
    expect(upload).toHaveBeenCalledWith(expect.any(File), "docs/a.txt")
    expect(onUploadComplete).toHaveBeenCalled()
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Upload complete", description: "Successfully uploaded 1 file" }),
    )
    expect(screen.queryByRole("button", { name: /^Upload/ })).not.toBeInTheDocument()
  })

  it("shows per-file errors when uploads fail", async () => {
    upload.mockRejectedValue(new ApiError(413, "Payload Too Large"))
    const user = userEvent.setup()
    const { onUploadComplete } = renderModal()

    await user.upload(screen.getByTestId("upload-input"), makeFile("a.txt"))
    await user.click(screen.getByRole("button", { name: "Upload 1 file" }))

    expect(await screen.findByText("The file is too large to upload.")).toBeInTheDocument()
    expect(screen.getByText("Failed")).toBeInTheDocument()
    expect(onUploadComplete).not.toHaveBeenCalled()
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive", description: "Failed to upload 1 file" }),
    )
    expect(screen.queryByText("All files uploaded successfully!")).not.toBeInTheDocument()
  })
})
