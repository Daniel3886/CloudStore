import { describe, expect, it } from "vitest"
import {
  getVirtualFolders,
  removeFolderTree,
  renameFolderTree,
  setVirtualFolders,
} from "@/features/files/lib/virtual-folders"
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

describe("folder tree helpers", () => {
  const folders = ["photos", "photos/2024", "photos-old", "docs"]

  it("removes a folder and its subfolders but not siblings with the same prefix", () => {
    expect(removeFolderTree(folders, "photos")).toEqual(["photos-old", "docs"])
  })

  it("renames a folder and its subfolders", () => {
    expect(renameFolderTree(folders, "photos", "pictures")).toEqual(["pictures", "pictures/2024", "photos-old", "docs"])
  })
})
