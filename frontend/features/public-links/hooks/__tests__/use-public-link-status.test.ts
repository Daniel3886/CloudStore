import { describe, expect, it } from "vitest"
import { indexActiveLinks } from "@/features/public-links/hooks/use-public-link-status"
import type { PublicFileAccessToken } from "@/features/public-links/api"

const now = Date.parse("2026-11-25T12:00:00Z")

function link(id: number, fileId: number, expiresAt: string, active = true): PublicFileAccessToken {
  return { id, token: `t${id}`, file: { id: fileId, displayName: "f", s3Key: "k", size: 1 }, expiresAt, active }
}

describe("indexActiveLinks", () => {
  it("keeps the latest-expiring active link per file and drops expired or inactive ones", () => {
    const index = indexActiveLinks(
      [
        link(1, 10, "2026-11-25T14:00:00Z"),
        link(2, 10, "2026-11-26T09:00:00Z"),
        link(3, 20, "2026-11-25T11:00:00Z"),
        link(4, 30, "2026-11-26T00:00:00Z", false),
      ],
      now,
    )
    expect(index.get(10)?.id).toBe(2)
    expect(index.has(20)).toBe(false)
    expect(index.has(30)).toBe(false)
  })
})
