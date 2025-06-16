"use client"

import { useState } from "react"
import {
  FileIcon,
  FileTextIcon,
  FolderIcon,
  ImageIcon,
  MoreVertical,
  FileArchiveIcon,
  FileAudioIcon,
  FileVideoIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ShareModal } from "./share-modal"
import { FileDetailsModal } from "./file-details-modal"

// Mock data for demonstration
const mockFiles = [
  {
    id: "1",
    name: "Project Documentation",
    type: "folder",
    items: 12,
    size: null,
    modified: "2023-05-10T14:48:00",
    owner: "John Doe",
  },
  {
    id: "2",
    name: "Design Assets",
    type: "folder",
    items: 8,
    size: null,
    modified: "2023-05-12T09:30:00",
    owner: "John Doe",
  },
  {
    id: "3",
    name: "quarterly_report.pdf",
    type: "pdf",
    items: null,
    size: 4500000, // 4.5 MB
    modified: "2023-05-15T16:22:00",
    owner: "John Doe",
  },
  {
    id: "4",
    name: "presentation.pptx",
    type: "document",
    items: null,
    size: 2800000, // 2.8 MB
    modified: "2023-05-14T11:15:00",
    owner: "Jane Smith",
  },
  {
    id: "5",
    name: "logo.png",
    type: "image",
    items: null,
    size: 1200000, // 1.2 MB
    modified: "2023-05-13T10:45:00",
    owner: "John Doe",
  },
  {
    id: "6",
    name: "data_backup.zip",
    type: "archive",
    items: null,
    size: 156000000, // 156 MB
    modified: "2023-05-11T08:20:00",
    owner: "John Doe",
  },
  {
    id: "7",
    name: "product_demo.mp4",
    type: "video",
    items: null,
    size: 85000000, // 85 MB
    modified: "2023-05-09T15:30:00",
    owner: "Jane Smith",
  },
  {
    id: "8",
    name: "podcast_interview.mp3",
    type: "audio",
    items: null,
    size: 24000000, // 24 MB
    modified: "2023-05-08T13:10:00",
    owner: "John Doe",
  },
]

interface FileBrowserProps {
  type?: "all" | "shared" | "recent" | "trash"
}

export function FileBrowser({ type = "all" }: FileBrowserProps) {
  const [shareOpen, setShareOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<any>(null)

  // Filter files based on type
  const filteredFiles = mockFiles.filter((file) => {
    if (type === "all") return true
    if (type === "shared") return file.owner !== "John Doe"
    if (type === "recent") {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return new Date(file.modified) > oneWeekAgo
    }
    return true
  })

  const formatSize = (bytes: number | null) => {
    if (bytes === null) return ""
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "folder":
        return <FolderIcon className="h-10 w-10 text-blue-500" />
      case "image":
        return <ImageIcon className="h-10 w-10 text-green-500" />
      case "pdf":
      case "document":
        return <FileTextIcon className="h-10 w-10 text-red-500" />
      case "archive":
        return <FileArchiveIcon className="h-10 w-10 text-yellow-500" />
      case "audio":
        return <FileAudioIcon className="h-10 w-10 text-purple-500" />
      case "video":
        return <FileVideoIcon className="h-10 w-10 text-pink-500" />
      default:
        return <FileIcon className="h-10 w-10 text-gray-500" />
    }
  }

  const handleFileAction = (action: string, file: any) => {
    setSelectedFile(file)

    if (action === "share") {
      setShareOpen(true)
    } else if (action === "details") {
      setDetailsOpen(true)
    }
    // Other actions would be implemented here
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredFiles.map((file) => (
        <Card key={file.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-start justify-between">
                {getFileIcon(file.type)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mr-2 -mt-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleFileAction("download", file)}>Download</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFileAction("share", file)}>Share</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFileAction("rename", file)}>Rename</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFileAction("move", file)}>Move</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleFileAction("details", file)}>Details</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleFileAction("delete", file)} className="text-red-500">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-4">
                <h3 className="font-medium truncate" title={file.name}>
                  {file.name}
                </h3>
                <div className="mt-1 text-xs text-muted-foreground">
                  {file.type === "folder" ? <p>{file.items} items</p> : <p>{formatSize(file.size)}</p>}
                  <p>Modified {formatDate(file.modified)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedFile && (
        <>
          <ShareModal open={shareOpen} onOpenChange={setShareOpen} file={selectedFile} />
          <FileDetailsModal open={detailsOpen} onOpenChange={setDetailsOpen} file={selectedFile} />
        </>
      )}
    </div>
  )
}
