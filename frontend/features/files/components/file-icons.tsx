import {
  FileIcon,
  FileTextIcon,
  FolderIcon,
  ImageIcon,
  FileArchiveIcon,
  FileAudioIcon,
  FileVideoIcon,
} from "lucide-react"

interface FileIconProps {
  fileType: string
  className?: string
}

export function FileIconComponent({ fileType, className = "h-10 w-10" }: FileIconProps) {
  switch (fileType) {
    case "folder":
      return <FolderIcon className={`${className} text-blue-500`} />
    case "image":
      return <ImageIcon className={`${className} text-green-500`} />
    case "pdf":
    case "document":
      return <FileTextIcon className={`${className} text-red-500`} />
    case "archive":
      return <FileArchiveIcon className={`${className} text-yellow-500`} />
    case "audio":
      return <FileAudioIcon className={`${className} text-purple-500`} />
    case "video":
      return <FileVideoIcon className={`${className} text-pink-500`} />
    default:
      return <FileIcon className={`${className} text-gray-500`} />
  }
}
