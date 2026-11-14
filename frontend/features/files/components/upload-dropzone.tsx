"use client"

import type React from "react"
import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadDropzoneProps {
  compact: boolean
  onFilesDropped: (files: File[]) => void
  onBrowse: () => void
}

const hasFiles = (e: React.DragEvent) => e.dataTransfer.types.includes("Files")

export function UploadDropzone({ compact, onFilesDropped, onBrowse }: UploadDropzoneProps) {
  const t = useTranslations("files.upload")
  const [dragActive, setDragActive] = useState(false)
  const zoneRef = useRef<HTMLDivElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasFiles(e)) setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = zoneRef.current?.getBoundingClientRect()
    if (rect && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files.length > 0) onFilesDropped(Array.from(e.dataTransfer.files))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onBrowse()
    }
  }

  return (
    <div
      ref={zoneRef}
      role="button"
      tabIndex={0}
      aria-label={t("dropzoneLabel")}
      className={cn(
        "relative border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-200 ease-in-out",
        compact ? "p-6 min-h-[120px]" : "p-12 min-h-[200px]",
        dragActive
          ? "border-primary bg-primary/10 scale-[1.02]"
          : "border-muted-foreground/25 hover:bg-muted/50 hover:border-muted-foreground/40",
      )}
      onClick={onBrowse}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragOver}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="pointer-events-none">
        <Upload
          className={cn(
            "mx-auto transition-all duration-200",
            compact ? "h-8 w-8" : "h-12 w-12",
            dragActive ? "text-primary" : "text-muted-foreground",
          )}
        />
        <div className={compact ? "h-[20px] mt-1" : "h-[24px] mt-2"}>
          <p className={cn("font-medium", compact ? "text-xs" : "text-sm")}>
            {dragActive ? t("dropHere") : compact ? t("dragMore") : t("dragOrBrowse")}
          </p>
        </div>
        {!compact && <p className="text-sm text-muted-foreground mt-1">{t("supported")}</p>}
      </div>
    </div>
  )
}
