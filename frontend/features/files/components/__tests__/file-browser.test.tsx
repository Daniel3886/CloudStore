import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithIntl } from "@/test/render"
import { filesApi, type FileResponse } from "@/features/files/api"
import { FileBrowser } from "@/features/files/components/file-browser"
import { setVirtualFolders } from "@/features/files/lib/virtual-folders"

vi.mock("@/features/files/api", () => ({
  filesApi: { list: vi.fn(), listTrash: vi.fn(), moveToTrash: vi.fn(), deleteFolder: vi.fn() },
}))
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))

const api = vi.mocked(filesApi)

const backendFiles: FileResponse[] = [
  { id: 1, key: "k1", size: 1536, lastModified: "2024-01-01T00:00:00Z", displayName: "1700000000000-report.pdf" },
  { id: 2, key: "k2", size: 10, lastModified: "2024-01-01T00:00:00Z", displayName: "docs/notes.txt" },
]

describe("FileBrowser", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders root files and virtual folders", async () => {
    api.list.mockResolvedValue(backendFiles)
    setVirtualFolders(["docs"])

    renderWithIntl(<FileBrowser />)

    expect(screen.getByText("Loading files...")).toBeInTheDocument()
    expect(await screen.findByText("report.pdf")).toBeInTheDocument()
    expect(screen.getByText("1.5 kB")).toBeInTheDocument()
    expect(screen.getByText("docs")).toBeInTheDocument()
    expect(screen.getByText("Folder")).toBeInTheDocument()
    expect(screen.queryByText("notes.txt")).not.toBeInTheDocument()
  })

  it("navigates into a folder when it is clicked", async () => {
    api.list.mockResolvedValue(backendFiles)
    setVirtualFolders(["docs"])
    const onCurrentPathChange = vi.fn()

    renderWithIntl(<FileBrowser onCurrentPathChange={onCurrentPathChange} />)
    await userEvent.click(await screen.findByText("docs"))

    expect(onCurrentPathChange).toHaveBeenCalledWith("docs")
  })

  it("reloads files and saved folders when the refresh signal changes without remounting", async () => {
    api.list.mockResolvedValue(backendFiles)
    const { rerender } = renderWithIntl(<FileBrowser />)
    expect(await screen.findByText("report.pdf")).toBeInTheDocument()

    setVirtualFolders(["new-folder"])
    api.list.mockResolvedValue([
      ...backendFiles,
      { id: 3, key: "k3", size: 1, lastModified: "2024-01-01T00:00:00Z", displayName: "uploaded.txt" },
    ])
    rerender(<FileBrowser refreshSignal={1} />)

    expect(screen.getByText("report.pdf")).toBeInTheDocument()
    expect(await screen.findByText("uploaded.txt")).toBeInTheDocument()
    expect(screen.getByText("new-folder")).toBeInTheDocument()
    expect(api.list).toHaveBeenCalledTimes(2)
  })

  it("opens folders from the keyboard", async () => {
    api.list.mockResolvedValue(backendFiles)
    setVirtualFolders(["docs"])
    const onCurrentPathChange = vi.fn()
    const user = userEvent.setup()

    renderWithIntl(<FileBrowser onCurrentPathChange={onCurrentPathChange} />)
    const folder = await screen.findByRole("button", { name: "docs" })
    folder.focus()
    await user.keyboard("{Enter}")

    expect(onCurrentPathChange).toHaveBeenCalledWith("docs")
  })

  it("labels folder deletion as permanent", async () => {
    api.list.mockResolvedValue(backendFiles)
    setVirtualFolders(["docs"])
    const user = userEvent.setup()

    renderWithIntl(<FileBrowser />)
    await user.click(await screen.findByRole("button", { name: "Actions for docs" }))

    expect(await screen.findByRole("menuitem", { name: "Delete Permanently" })).toBeInTheDocument()
    expect(screen.queryByRole("menuitem", { name: "Move to Trash" })).not.toBeInTheDocument()
  })

  it("shows the folder contents with breadcrumbs and a back button", async () => {
    api.list.mockResolvedValue(backendFiles)
    const onCurrentPathChange = vi.fn()

    renderWithIntl(<FileBrowser currentPath="docs" onCurrentPathChange={onCurrentPathChange} />)

    expect(await screen.findByText("notes.txt")).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "Current folder" })).toHaveTextContent("My Files / docs")
    await userEvent.click(screen.getByRole("button", { name: "Back" }))
    expect(onCurrentPathChange).toHaveBeenCalledWith("")
  })

  it("filters by search query", async () => {
    api.list.mockResolvedValue(backendFiles)
    renderWithIntl(<FileBrowser searchQuery="nothing-matches" />)
    expect(await screen.findByText("No files found")).toBeInTheDocument()
    expect(screen.getByText("Upload some files or create a folder to get started")).toBeInTheDocument()
  })

  it("shows the trash empty state", async () => {
    api.listTrash.mockResolvedValue([])
    renderWithIntl(<FileBrowser type="trash" />)
    expect(await screen.findByText("Trash is empty")).toBeInTheDocument()
    expect(api.list).not.toHaveBeenCalled()
  })

  it("treats a 404 from the list endpoint as an empty list", async () => {
    const { ApiError } = await import("@/lib/api/client")
    api.list.mockRejectedValue(new ApiError(404, "Not found"))
    renderWithIntl(<FileBrowser />)
    expect(await screen.findByText("No files found")).toBeInTheDocument()
  })

  it("moves a file to trash after confirmation and reloads the list", async () => {
    api.list.mockResolvedValueOnce(backendFiles).mockResolvedValueOnce([backendFiles[1]])
    api.moveToTrash.mockResolvedValue("ok")
    const user = userEvent.setup()

    renderWithIntl(<FileBrowser />)
    await user.click(await screen.findByRole("button", { name: "Actions for report.pdf" }))
    await user.click(await screen.findByRole("menuitem", { name: "Move to Trash" }))
    expect(
      await screen.findByText(
        'Are you sure you want to move "report.pdf" to trash? You can restore it later from the trash.',
      ),
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Move to Trash" }))

    expect(api.moveToTrash).toHaveBeenCalledWith("k1")
    await waitFor(() => expect(screen.queryByText("report.pdf")).not.toBeInTheDocument())
    expect(api.list).toHaveBeenCalledTimes(2)
  })
})
