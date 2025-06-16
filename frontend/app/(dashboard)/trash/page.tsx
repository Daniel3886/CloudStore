import { FileBrowser } from "@/components/file-browser"
import { FileHeader } from "@/components/file-header"

export default function TrashPage() {
  return (
    <div className="flex flex-col gap-6">
      <FileHeader title="Trash" />
      <FileBrowser type="trash" />
    </div>
  )
}
