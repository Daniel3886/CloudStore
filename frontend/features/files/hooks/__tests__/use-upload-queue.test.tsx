import { act } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ApiError } from "@/lib/api/client"
import { filesApi } from "@/features/files/api"
import { useUploadQueue } from "@/features/files/hooks/use-upload-queue"
import { renderHookWithIntl } from "@/features/files/hooks/__tests__/render-hook-with-intl"

vi.mock("@/features/files/api", () => ({ filesApi: { upload: vi.fn() } }))

const upload = vi.mocked(filesApi.upload)
const makeFile = (name: string) => new File(["content"], name, { type: "text/plain" })

describe("useUploadQueue", () => {
  beforeEach(() => upload.mockReset())

  it("adds files as pending and renames duplicates", () => {
    const { result } = renderHookWithIntl(() => useUploadQueue(""))

    act(() => result.current.addFiles([makeFile("a.txt"), makeFile("a.txt")]))
    act(() => result.current.addFiles([makeFile("a.txt")]))

    expect(result.current.items.map((item) => item.file.name)).toEqual(["a.txt", "a (1).txt", "a (2).txt"])
    expect(result.current.items.every((item) => item.status === "pending")).toBe(true)
    expect(result.current.pendingCount).toBe(3)
  })

  it("uploads every pending file with the folder path prefix", async () => {
    upload.mockResolvedValue("ok")
    const { result } = renderHookWithIntl(() => useUploadQueue("docs/2024"))
    act(() => result.current.addFiles([makeFile("a.txt"), makeFile("b.txt")]))

    let outcome
    await act(async () => {
      outcome = await result.current.uploadAll()
    })

    expect(outcome).toEqual({ succeeded: 2, failed: 0 })
    expect(upload).toHaveBeenNthCalledWith(1, expect.any(File), "docs/2024/a.txt")
    expect(upload).toHaveBeenNthCalledWith(2, expect.any(File), "docs/2024/b.txt")
    expect(result.current.items.map((item) => item.status)).toEqual(["completed", "completed"])
    expect(result.current.isFinished).toBe(true)
    expect(result.current.hasErrors).toBe(false)
    expect(result.current.isUploading).toBe(false)
  })

  it("uploads root files without a prefix", async () => {
    upload.mockResolvedValue("ok")
    const { result } = renderHookWithIntl(() => useUploadQueue(""))
    act(() => result.current.addFiles([makeFile("a.txt")]))
    await act(() => result.current.uploadAll())
    expect(upload).toHaveBeenCalledWith(expect.any(File), "a.txt")
  })

  it("marks failed uploads with the backend message or a fallback", async () => {
    upload
      .mockResolvedValueOnce("ok")
      .mockRejectedValueOnce(new ApiError(413, "File too large"))
      .mockRejectedValueOnce("boom")
    const { result } = renderHookWithIntl(() => useUploadQueue(""))
    act(() => result.current.addFiles([makeFile("a.txt"), makeFile("b.txt"), makeFile("c.txt")]))

    let outcome
    await act(async () => {
      outcome = await result.current.uploadAll()
    })

    expect(outcome).toEqual({ succeeded: 1, failed: 2 })
    expect(result.current.items.map((item) => [item.status, item.error])).toEqual([
      ["completed", undefined],
      ["error", "File too large"],
      ["error", "Upload failed"],
    ])
    expect(result.current.hasErrors).toBe(true)
    expect(result.current.isFinished).toBe(true)
  })

  it("removes and clears queued files", () => {
    const { result } = renderHookWithIntl(() => useUploadQueue(""))
    act(() => result.current.addFiles([makeFile("a.txt"), makeFile("b.txt")]))
    act(() => result.current.removeItem(result.current.items[0].id))
    expect(result.current.items.map((item) => item.file.name)).toEqual(["b.txt"])
    act(() => result.current.clear())
    expect(result.current.items).toEqual([])
  })
})
