import { FileBrowser } from "@/components/file-browser"
import { FileHeader } from "@/components/file-header"

export default function SharedPage() {
  return (
    <div className="flex flex-col gap-6">
      <FileHeader title="Shared with me" />
      <FileBrowser type="shared" />
    </div>
  )
}
