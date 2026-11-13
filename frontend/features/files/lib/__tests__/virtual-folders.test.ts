import { describe, expect, it } from "vitest"
import { getVirtualFolders, setVirtualFolders } from "@/features/files/lib/virtual-folders"
import { setUserEmail } from "@/lib/session"

describe("virtual folders", () => {
  it("keeps folders separate per user", () => {
    setUserEmail("a@example.com")
    setVirtualFolders(["photos"])
    setUserEmail("b@example.com")
    expect(getVirtualFolders()).toEqual([])
    setUserEmail("a@example.com")
    expect(getVirtualFolders()).toEqual(["photos"])
  })

  it("ignores corrupted stored values", () => {
    setUserEmail("a@example.com")
    localStorage.setItem("virtualFolders_a@example.com", "{not json")
    expect(getVirtualFolders()).toEqual([])
  })
})
