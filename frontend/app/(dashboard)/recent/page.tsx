import { FileBrowser } from "@/components/file-browser"
import { FileHeader } from "@/components/file-header"

export default function RecentPage() {
  return (
    <div className="flex flex-col gap-6">
      <FileHeader title="Recent files" />
      <FileBrowser type="recent" />
    </div>
  )
}
