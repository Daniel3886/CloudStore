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
}

interface FileUploadStatus {
  file: File
  status: "pending" | "uploading" | "completed" | "error"
  progress: number
  error?: string
}

export function UploadModal({ open, onOpenChange, onUploadComplete }: UploadModalProps) {
  const [files, setFiles] = useState<FileUploadStatus[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        status: "pending" as const,
        progress: 0,
      }))
      setFiles(newFiles)
    }
  }

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles = Array.from(fileList).map((file) => ({
      file,
      status: "pending" as const,
      progress: 0,
    }))
    setFiles(newFiles)
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter((prev) => prev + 1)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter((prev) => {
      const newCounter = prev - 1
      if (newCounter === 0) {
        setDragActive(false)
      }
      return newCounter
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      setDragCounter(0)

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
    setDragCounter(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadSingleFile = async (fileStatus: FileUploadStatus, index: number): Promise<boolean> => {
    try {
      // Update status to uploading
      setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "uploading", progress: 0 } : f)))

      const formData = new FormData()
      formData.append("file", fileStatus.file)

      // Create headers object without Content-Type for FormData
      const headers: Record<string, string> = {}

      // Get access token and add to headers if it exists
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
        const result = await response.text()

        // Update status to completed
        setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "completed", progress: 100 } : f)))

        return true
      } else if (response.status === 401) {
        // Try to refresh token and retry
        const refreshSuccess = await refreshAccessToken()
        if (refreshSuccess) {
          // Retry with new token
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
      // Update status to error
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
        // Refresh token is invalid, clear tokens
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

    // Upload files sequentially
    for (let i = 0; i < files.length; i++) {
      const success = await uploadSingleFile(files[i], i)
      if (success) {
        successCount++
      } else {
        errorCount++
      }
    }

    setUploading(false)

    // Show results
    if (successCount > 0) {
      showSuccess(
        "Upload complete",
        `Successfully uploaded ${successCount} file(s)${errorCount > 0 ? `, ${errorCount} failed` : ""}`,
      )

      // Call the callback to refresh file browser
      if (onUploadComplete) {
        onUploadComplete()
      }
    }

    if (errorCount > 0 && successCount === 0) {
      showError("Upload failed", `Failed to upload ${errorCount} file(s)`)
    }

    // Close modal after a short delay if all uploads completed
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
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "uploading":
        return <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      default:
        return <FileIcon className="h-5 w-5 text-muted-foreground" />
    }
  }

  const allCompleted = files.length > 0 && files.every((f) => f.status === "completed" || f.status === "error")
  const hasErrors = files.some((f) => f.status === "error")

  const handleCancel = () => {
    if (uploading) {
      // If currently uploading, just close the modal
      onOpenChange(false)
      resetToInitialState()
    } else if (files.length > 0) {
      // If files are selected but not uploading, go back to file selection
      resetToInitialState()
    } else {
      // If no files selected, close the modal
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    resetToInitialState()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>Upload files to your storage. You can upload multiple files at once.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!uploading && files.length === 0 && (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? "border-primary bg-primary/10 scale-[1.02]"
                  : "border-muted-foreground/25 hover:bg-muted/50 hover:border-muted-foreground/40"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload
                className={`h-12 w-12 mx-auto transition-colors duration-200 ${
                  dragActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <p className="mt-2 font-medium">
                {dragActive ? "Drop files here" : "Drag and drop files here or click to browse"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Support for documents, images, videos, and more</p>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((fileStatus, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getStatusIcon(fileStatus.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fileStatus.file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {(fileStatus.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
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
            <div className="flex items-center gap-2 text-green-500 justify-center">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-medium">All files uploaded successfully!</p>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={allCompleted ? handleClose : handleCancel}
            disabled={uploading}
          >
            {allCompleted ? "Close" : files.length > 0 && !uploading ? "Back" : "Cancel"}
          </Button>
          {!allCompleted && (
            <Button type="button" onClick={handleUpload} disabled={files.length === 0 || uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
