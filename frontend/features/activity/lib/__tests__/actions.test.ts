import { Activity, Download, Link, Share2, Trash2, Upload } from "lucide-react"
import { describe, expect, it } from "vitest"
import {
  ACTION_TONE_CLASSES,
  KNOWN_ACTIONS,
  formatActionCode,
  getActionIcon,
  getActionTone,
  isKnownAction,
} from "@/features/activity/lib/actions"
import messages from "@/messages/en"

describe("activity action helpers", () => {
  it("recognises known action codes", () => {
    expect(isKnownAction("FILE_UPLOAD")).toBe(true)
    expect(isKnownAction("SOMETHING_NEW")).toBe(false)
  })

  it("has a translation for every known action and nothing else", () => {
    expect(Object.keys(messages.activity.actions).sort()).toEqual([...KNOWN_ACTIONS].sort())
  })

  it("formats unknown codes as a readable fallback", () => {
    expect(formatActionCode("SOMETHING_NEW_HAPPENED")).toBe("SOMETHING NEW HAPPENED")
  })

  it("maps actions to icons", () => {
    expect(getActionIcon("FILE_UPLOAD")).toBe(Upload)
    expect(getActionIcon("PUBLIC_FILE_ACCESS")).toBe(Download)
    expect(getActionIcon("SHARE_FILE")).toBe(Share2)
    expect(getActionIcon("FILE_SOFT_DELETE")).toBe(Trash2)
    expect(getActionIcon("PUBLIC_LINK_GENERATION")).toBe(Link)
    expect(getActionIcon("SOMETHING_NEW")).toBe(Activity)
  })

  it("maps actions to tones", () => {
    expect(getActionTone("FILE_UPLOAD")).toBe("create")
    expect(getActionTone("USER_REGISTER")).toBe("create")
    expect(getActionTone("SHARE_FILE")).toBe("share")
    expect(getActionTone("FILE_PERMANENT_DELETE")).toBe("destructive")
    expect(getActionTone("FILE_RENAME")).toBe("edit")
    expect(getActionTone("FILE_RESTORE")).toBe("restore")
    expect(getActionTone("SOMETHING_NEW")).toBe("neutral")
    expect(ACTION_TONE_CLASSES.neutral).toContain("bg-slate-500/10")
  })
})
