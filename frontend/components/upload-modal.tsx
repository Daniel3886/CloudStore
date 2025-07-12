"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Upload, X, FileIcon, CheckCircle, AlertCircle } from "lucide-react"
import { showSuccess, showError } from "@/components/ui/notification"

interface UploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete?: () => void
  currentPath?: string
}

interface FileUploadStatus {
  file: File
  status: "pending" | "uploading" | "completed" | "error"
  progress: number
  error?: string
}

export function UploadModal({ open, onOpenChange, onUploadComplete, currentPath = "" }: UploadModalProps) {
  const [files, setFiles] = useState<FileUploadStatus[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addMoreInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const processFiles = (newFiles: File[], existingFiles: FileUploadStatus[]) => {
    const processedFiles: FileUploadStatus[] = newFiles.map((file) => ({
      file: file,
      status: "pending",
      progress: 0,
    }))

    return processedFiles
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const processedFiles = processFiles(newFiles, files)
      setFiles((prev) => [...prev, ...processedFiles])
    }
    e.target.value = ""
  }

  const handleAddMoreFiles = () => {
    addMoreInputRef.current?.click()
  }

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const newFiles = Array.from(fileList)
      const processedFiles = processFiles(newFiles, files)
      setFiles((prev) => [...prev, ...processedFiles])
    },
    [files],
  )

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = dropZoneRef.current?.getBoundingClientRect()
    if (
      rect &&
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      setDragActive(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = dropZoneRef.current?.getBoundingClientRect()
    if (rect && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY <= rect.bottom)) {
      setDragActive(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes("Files")) {
      setDragActive(true)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const resetToInitialState = () => {
    setFiles([])
    setUploading(false)
    setDragActive(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (addMoreInputRef.current) {
      addMoreInputRef.current.value = ""
    }
  }

  const uploadSingleFile = async (fileStatus: FileUploadStatus, index: number): Promise<boolean> => {
    try {
      setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "uploading", progress: 0 } : f)))

      const formData = new FormData()

      let s3Key: string
      let displayName: string

      if (currentPath) {
        const timestamp = Date.now()
        const originalFileName = fileStatus.file.name
        s3Key = `${currentPath}/${timestamp}-${originalFileName}`

        displayName = `${currentPath}/${originalFileName}`

        console.log("Uploading to folder:")
        console.log("- Current path:", currentPath)
        console.log("- S3 key:", s3Key)
        console.log("- Display name:", displayName)
      } else {
        const timestamp = Date.now()
        s3Key = `${timestamp}-${fileStatus.file.name}`
        displayName = fileStatus.file.name

        console.log("Uploading to root:")
        console.log("- S3 key:", s3Key)
        console.log("- Display name:", displayName)
      }

      const fileToUpload = new File([fileStatus.file], s3Key, { type: fileStatus.file.type })
      formData.append("file", fileToUpload)

      formData.append("displayName", displayName)

      const headers: Record<string, string> = {}
      const accessToken = localStorage.getItem("accessToken")
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`
      }

      const response = await fetch("http://localhost:8080/file/upload", {
        method: "POST",
        headers,
        body: formData,
        credentials: "include",
      })

      if (response.ok) {
        setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "completed", progress: 100 } : f)))
        return true
      } else if (response.status === 401) {
        const refreshSuccess = await refreshAccessToken()
        if (refreshSuccess) {
          const newAccessToken = localStorage.getItem("accessToken")
          if (newAccessToken) {
            headers["Authorization"] = `Bearer ${newAccessToken}`
          }
          const retryResponse = await fetch("http://localhost:8080/file/upload", {
            method: "POST",
            headers,
            body: formData,
            credentials: "include",
          })
          if (retryResponse.ok) {
            setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "completed", progress: 100 } : f)))
            return true
          }
        }
        throw new Error("Authentication failed. Please log in again.")
      } else {
        const errorText = await response.text()
        throw new Error(errorText || `Upload failed: ${response.status}`)
      }
    } catch (error: any) {
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "error", progress: 0, error: error.message } : f)),
      )
      return false
    }
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (!refreshToken) {
        return false
      }
      const response = await fetch("http://localhost:8080/auth/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("accessToken", data.accessToken)
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken)
        }
        return true
      } else {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("userEmail")
        return false
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
      return false
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < files.length; i++) {
      const success = await uploadSingleFile(files[i], i)
      if (success) {
        successCount++
      } else {
        errorCount++
      }
    }

    setUploading(false)

    if (successCount > 0) {
      showSuccess(
        "Upload complete",
        `Successfully uploaded ${successCount} file(s)${errorCount > 0 ? `, ${errorCount} failed` : ""}`,
      )
      if (onUploadComplete) {
        onUploadComplete()
      }
    }

    if (errorCount > 0 && successCount === 0) {
      showError("Upload failed", `Failed to upload ${errorCount} file(s)`)
    }

    if (errorCount === 0) {
      setTimeout(() => {
        onOpenChange(false)
        resetToInitialState()
      }, 1500)
    }
  }

  const getStatusIcon = (status: FileUploadStatus["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "uploading":
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      default:
        return <FileIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const allCompleted = files.length > 0 && files.every((f) => f.status === "completed" || f.status === "error")
  const hasErrors = files.some((f) => f.status === "error")

  const handleCancel = () => {
    if (uploading) {
      onOpenChange(false)
      resetToInitialState()
    } else if (files.length > 0) {
      resetToInitialState()
    } else {
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    resetToInitialState()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>
            Upload files to {currentPath ? `"${currentPath}"` : "your storage"}. Files will be organized using stable
            folder prefixes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!uploading && files.length === 0 && (
            <div
              ref={dropZoneRef}
              className={`
                relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                 transition-colors duration-200 ease-in-out
                min-h-[200px]
                  ${
                    dragActive
                      ? "border-primary bg-primary/10"
                      : "border-muted-foreground/25 hover:bg-muted/50 hover:border-muted-foreground/40"
                  }
              `}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="pointer-events-none">
                <Upload
                  className={`
                  h-12 w-12 mx-auto transition-colors duration-200
                   ${dragActive ? "text-primary" : "text-muted-foreground"}
                `}
                />
                <div className="h-[24px] mt-2">
                  <p className="font-medium text-sm">
                    {dragActive ? "Drop files here" : "Drag and drop files here or click to browse"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Support for documents, images, videos, and more</p>
              </div>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
            </div>
          )}

          {!uploading && files.length > 0 && (
            <div
              ref={dropZoneRef}
              className={`
                relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                 transition-colors duration-200 ease-in-out
                ${
                  dragActive
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/25 hover:bg-muted/50 hover:border-muted-foreground/40"
                }
              `}
              onClick={handleAddMoreFiles}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="pointer-events-none">
                <Upload
                  className={`
                  h-8 w-8 mx-auto transition-colors duration-200
                   ${dragActive ? "text-primary" : "text-muted-foreground"}
                `}
                />
                <div className="h-[20px] mt-1">
                  <p className="font-medium text-sm">{dragActive ? "Drop more files here" : "Add more files"}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Drag and drop or click to browse for additional files
                </p>
              </div>
              <input ref={addMoreInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((fileStatus, index) => (
                <div
                  key={`${fileStatus.file.name}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getStatusIcon(fileStatus.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fileStatus.file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {(fileStatus.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {currentPath && <p className="text-xs text-blue-600">→ {currentPath}/</p>}
                        {fileStatus.status === "uploading" && (
                          <div className="flex-1 max-w-20">
                            <Progress value={fileStatus.progress} className="h-1" />
                          </div>
                        )}
                      </div>
                      {fileStatus.error && <p className="text-xs text-red-500 mt-1">{fileStatus.error}</p>}
                    </div>
                  </div>
                  {!uploading && fileStatus.status === "pending" && (
                    <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {allCompleted && !hasErrors && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">All files uploaded successfully!</span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {allCompleted ? "Close" : files.length > 0 && !uploading ? "Clear All" : "Cancel"}
          </Button>
          {!allCompleted && (
            <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
