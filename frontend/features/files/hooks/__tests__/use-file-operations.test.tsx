import { act } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ApiError } from "@/lib/api/client"
import { toast } from "@/hooks/use-toast"
import { saveBlob } from "@/lib/download"
import { filesApi } from "@/features/files/api"
import { useFileOperations } from "@/features/files/hooks/use-file-operations"
import { renderHookWithIntl } from "@/features/files/hooks/__tests__/render-hook-with-intl"
import type { FileItem } from "@/features/files/types"

vi.mock("@/features/files/api", () => ({
  filesApi: {
    download: vi.fn(),
    moveToTrash: vi.fn(),
    deleteFolder: vi.fn(),
    rename: vi.fn(),
    renameFolder: vi.fn(),
    restore: vi.fn(),
    deletePermanently: vi.fn(),
  },
}))
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))
vi.mock("@/lib/download", () => ({ saveBlob: vi.fn() }))

const api = vi.mocked(filesApi)

const file: FileItem = {
  id: 5,
  name: "report.pdf",
  displayName: "docs/report.pdf",
  type: "pdf",
  s3Key: "key-5",
  path: "docs",
  isFolder: false,
}
const folder: FileItem = {
  id: -1,
  name: "2024",
  displayName: "docs/2024",
  type: "folder",
  path: "docs",
  isFolder: true,
}

describe("useFileOperations", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("moves files to trash", async () => {
    api.moveToTrash.mockResolvedValue("ok")
    const { result } = renderHookWithIntl(() => useFileOperations())

    let ok
    await act(async () => {
      ok = await result.current.deleteFile(file)
    })

    expect(ok).toBe(true)
    expect(api.moveToTrash).toHaveBeenCalledWith("key-5")
    expect(api.deleteFolder).not.toHaveBeenCalled()
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "success",
        title: "File deleted",
        description: "report.pdf has been deleted successfully.",
      }),
    )
    expect(result.current.loadingStates[file.id]).toBe(false)
  })

  it("deletes folders by their full path", async () => {
    api.deleteFolder.mockResolvedValue("ok")
    const { result } = renderHookWithIntl(() => useFileOperations())
    await act(() => result.current.deleteFile(folder))
    expect(api.deleteFolder).toHaveBeenCalledWith("docs/2024")
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Folder deleted" }))
  })

  it("reports delete failures with the backend message", async () => {
    api.moveToTrash.mockRejectedValue(new ApiError(500, "Storage offline"))
    const { result } = renderHookWithIntl(() => useFileOperations())

    let ok
    await act(async () => {
      ok = await result.current.deleteFile(file)
    })

    expect(ok).toBe(false)
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive", title: "Delete failed", description: "Storage offline" }),
    )
  })

  it("refuses to delete a file without a key", async () => {
    const { result } = renderHookWithIntl(() => useFileOperations())
    await act(() => result.current.deleteFile({ ...file, s3Key: undefined }))
    expect(api.moveToTrash).not.toHaveBeenCalled()
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Missing key" }))
  })

  it("renames files using the file's folder path", async () => {
    api.rename.mockResolvedValue("ok")
    const { result } = renderHookWithIntl(() => useFileOperations())

    let error
    await act(async () => {
      error = await result.current.renameFile(file, "final.pdf")
    })

    expect(error).toBeNull()
    expect(api.rename).toHaveBeenCalledWith("key-5", "docs/final.pdf")
  })

  it("renames folders from old path to new path", async () => {
    api.renameFolder.mockResolvedValue("ok")
    const { result } = renderHookWithIntl(() => useFileOperations())
    await act(() => result.current.renameFile(folder, "2025"))
    expect(api.renameFolder).toHaveBeenCalledWith("docs/2024", "docs/2025")
  })

  it("skips the request when the name is unchanged and returns errors as messages", async () => {
    api.rename.mockRejectedValue("network down")
    const { result } = renderHookWithIntl(() => useFileOperations())

    let unchanged, failed
    await act(async () => {
      unchanged = await result.current.renameFile(file, "report.pdf")
      failed = await result.current.renameFile(file, "other.pdf")
    })

    expect(unchanged).toBeNull()
    expect(failed).toBe("Failed to rename file.")
    expect(api.rename).toHaveBeenCalledTimes(1)
  })

  it("downloads files and saves the blob under the file name", async () => {
    const blob = new Blob(["x"])
    api.download.mockResolvedValue(blob)
    const { result } = renderHookWithIntl(() => useFileOperations())
    await act(() => result.current.downloadFile(file))
    expect(api.download).toHaveBeenCalledWith("key-5")
    expect(saveBlob).toHaveBeenCalledWith(blob, "report.pdf")
  })

  it("restores and permanently deletes files by key", async () => {
    api.restore.mockResolvedValue("ok")
    api.deletePermanently.mockResolvedValue("ok")
    const { result } = renderHookWithIntl(() => useFileOperations())
    await act(async () => {
      await result.current.restoreFile(file)
      await result.current.permanentlyDeleteFile(file)
    })
    expect(api.restore).toHaveBeenCalledWith("key-5")
    expect(api.deletePermanently).toHaveBeenCalledWith("key-5")
  })

  it("warns instead of downloading an empty folder", async () => {
    const { result } = renderHookWithIntl(() => useFileOperations())
    await act(() => result.current.downloadFolder(folder, []))
    expect(api.download).not.toHaveBeenCalled()
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Empty folder" }))
  })
})
