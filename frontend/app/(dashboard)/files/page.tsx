import { FileBrowser } from "@/components/file-browser"
import { FileHeader } from "@/components/file-header"

export default function FilesPage() {
  return (
    <div className="flex flex-col gap-6">
      <FileHeader />
      <FileBrowser />
    </div>
  )
}
