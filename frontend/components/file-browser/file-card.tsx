"use client"
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
import { Download, Trash2, Share2, Edit, MoreVertical } from "lucide-react"
import { FileIconComponent } from "./file-icons"
import { formatFileSize, formatDate } from "@/lib/file-utils"

interface FileItem {
  id: string
  name: string
  type: string
  size: number | null
  modified: string
  owner?: string
  s3Key?: string
  displayName: string
  path: string
  isFolder: boolean
}

interface FileCardProps {
  file: FileItem
  isLoading: boolean
  isTrashView?: boolean
  onFileClick: (file: FileItem) => void
  onFileAction: (action: string, file: FileItem) => void
}

export function FileCard({ file, isLoading, isTrashView = false, onFileClick, onFileAction }: FileCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md hover:bg-muted/30 transition-all duration-200"
      onClick={() => !isTrashView && onFileClick(file)} 
    >
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="pointer-events-none">
              <FileIconComponent fileType={file.type} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mr-2 -mt-2 hover:bg-muted/60"
                  disabled={isLoading}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isTrashView ? (
                  <>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onFileAction("restore", file)
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Restore
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onFileAction("permanent-delete", file)
                      }}
                      className="text-red-500"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Permanently
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onFileAction("download", file)
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download {file.isFolder ? "as ZIP" : ""}
                    </DropdownMenuItem>
                    {!file.isFolder && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onFileAction("share", file)
                        }}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onFileAction("rename", file)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onFileAction("details", file)
                      }}
                    >
                      Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onFileAction("delete", file)
                      }}
                      className="text-red-500"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Move to Trash
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mt-4 pointer-events-none">
            <h3 className="font-medium truncate" title={file.name}>
              {file.name}
            </h3>
            <div className="mt-1 text-xs text-muted-foreground">
              {file.isFolder ? <p>Folder</p> : <p>{formatFileSize(file.size)}</p>}
              <p>Modified {formatDate(file.modified)}</p>
              {isTrashView && <p className="text-red-500">In Trash</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
