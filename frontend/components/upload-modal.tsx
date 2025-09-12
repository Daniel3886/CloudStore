"use client";

import type React from "react";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  X,
  FileIcon,
  CheckCircle,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiUrl } from "@/lib/config";

interface UploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete?: () => void
  currentPath?: string
}
interface FileUploadStatus {
  file: File;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  error?: string;
}

export function UploadModal({
  open,
  onOpenChange,
  onUploadComplete,
  currentPath = ""
}: UploadModalProps) {
  const [files, setFiles] = useState<FileUploadStatus[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDuplicateFiles = (
    newFiles: File[],
    existingFiles: FileUploadStatus[]
  ): File[] => {
    const existingNames = existingFiles.map((f) => f.file.name);

    return newFiles.map((file) => {
      let fileName = file.name;
      let counter = 1;

      while (existingNames.includes(fileName)) {
        const lastDotIndex = file.name.lastIndexOf(".");
        if (lastDotIndex === -1) {
          fileName = `${file.name} (${counter})`;
        } else {
          const nameWithoutExt = file.name.substring(0, lastDotIndex);
          const extension = file.name.substring(lastDotIndex);
          fileName = `${nameWithoutExt} (${counter})${extension}`;
        }
        counter++;
      }

      if (fileName !== file.name) {
        const newFile = new File([file], fileName, { type: file.type });
        return newFile;
      }

      return file;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFileArray = Array.from(e.target.files);
      const processedFiles = handleDuplicateFiles(newFileArray, files);

      const newFiles = processedFiles.map((file) => ({
        file,
        status: "pending" as const,
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleAdditionalFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      const newFileArray = Array.from(e.target.files);
      const processedFiles = handleDuplicateFiles(newFileArray, files);

      const newFiles = processedFiles.map((file) => ({
        file,
        status: "pending" as const,
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
    }

    if (additionalFileInputRef.current) {
      additionalFileInputRef.current.value = "";
    }
  };

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const newFileArray = Array.from(fileList);
      const processedFiles = handleDuplicateFiles(newFileArray, files);

      const newFiles = processedFiles.map((file) => ({
        file,
        status: "pending" as const,
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setDragActive(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (
      rect &&
      (e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom)
    ) {
      setDragActive(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setDragActive(true);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setFiles([]);
  };

  const resetToInitialState = () => {
    setFiles([]);
    setUploading(false);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (additionalFileInputRef.current) {
      additionalFileInputRef.current.value = "";
    }
  };

  const uploadSingleFile = async (
    fileStatus: FileUploadStatus,
    index: number
  ): Promise<boolean> => {
    try {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "uploading", progress: 0 } : f
        )
      );

      const formData = new FormData();

      const uploadFileName = currentPath
        ? `${currentPath}/${fileStatus.file.name}`
        : fileStatus.file.name;
      formData.append("file", fileStatus.file, uploadFileName);

      const headers: Record<string, string> = {};
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const response = await fetch(apiUrl("/file/upload"), {
        method: "POST",
        headers,
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index ? { ...f, status: "completed", progress: 100 } : f
          )
        );
        return true;
      } else {
        const errorText = await response.text();
        throw new Error(errorText || `Upload failed: ${response.status}`);
      }
    } catch (error: any) {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, status: "error", progress: 0, error: error.message }
            : f
        )
      );
      return false;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const success = await uploadSingleFile(files[i], i);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    setUploading(false);

    if (successCount > 0) {
      toast({
        variant: "success",
        title: "Upload complete",
        description: `Successfully uploaded ${successCount} file(s)${
          errorCount > 0 ? `, ${errorCount} failed` : ""
        }`,
      });
      if (onUploadComplete) {
        onUploadComplete();
      }
    }

    if (errorCount > 0 && successCount === 0) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: `Failed to upload ${errorCount} file(s)`,
      });
    }

    if (errorCount === 0) {
      setTimeout(() => {
        onOpenChange(false);
        resetToInitialState();
      }, 1500);
    }
  };

  const getStatusIcon = (status: FileUploadStatus["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "uploading":
        return (
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <FileIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const allCompleted =
    files.length > 0 &&
    files.every((f) => f.status === "completed" || f.status === "error");
  const hasErrors = files.some((f) => f.status === "error");
  const pendingFiles = files.filter((f) => f.status === "pending").length;

  const handleCancel = () => {
    if (uploading) {
      onOpenChange(false);
      resetToInitialState();
    } else if (files.length > 0) {
      resetToInitialState();
    } else {
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    resetToInitialState();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>
            Upload files to your storage. You can upload multiple files at once.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div
            ref={dropZoneRef}
            className={`
              relative border-2 border-dashed rounded-lg text-center cursor-pointer 
              transition-all duration-200 ease-in-out
              ${files.length === 0 ? "p-12 min-h-[200px]" : "p-6 min-h-[120px]"}
              ${
                dragActive
                  ? "border-primary bg-primary/10 scale-[1.02]"
                  : "border-muted-foreground/25 hover:bg-muted/50 hover:border-muted-foreground/40"
              }
            `}
            onClick={() =>
              files.length === 0
                ? fileInputRef.current?.click()
                : additionalFileInputRef.current?.click()
            }
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="pointer-events-none">
              <Upload
                className={`
                  ${
                    files.length === 0 ? "h-12 w-12" : "h-8 w-8"
                  } mx-auto transition-all duration-200 
                  ${dragActive ? "text-primary" : "text-muted-foreground"}
                `}
              />
              <div
                className={`${
                  files.length === 0 ? "h-[24px] mt-2" : "h-[20px] mt-1"
                }`}
              >
                <p
                  className={`font-medium ${
                    files.length === 0 ? "text-sm" : "text-xs"
                  }`}
                >
                  {dragActive
                    ? "Drop files here"
                    : files.length === 0
                    ? "Drag and drop files here or click to browse"
                    : "Drag more files here or click to add more"}
                </p>
              </div>
              {files.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Support for documents, images, videos, and more
                </p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              ref={additionalFileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleAdditionalFileChange}
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {files.length} file{files.length !== 1 ? "s" : ""} selected
                  {pendingFiles > 0 && ` (${pendingFiles} pending)`}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => additionalFileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <FolderOpen className="h-4 w-4 mr-1" />
                    Browse Files
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFiles}
                    disabled={uploading}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {files.map((fileStatus, index) => (
                  <div
                    key={`${fileStatus.file.name}-${index}`}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-md border"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getStatusIcon(fileStatus.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {fileStatus.file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {(fileStatus.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {fileStatus.status === "uploading" && (
                            <div className="flex-1 max-w-20">
                              <Progress
                                value={fileStatus.progress}
                                className="h-1"
                              />
                            </div>
                          )}
                          {fileStatus.status === "completed" && (
                            <span className="text-xs text-green-600 font-medium">
                              Uploaded
                            </span>
                          )}
                          {fileStatus.status === "error" && (
                            <span className="text-xs text-red-600 font-medium">
                              Failed
                            </span>
                          )}
                        </div>
                        {fileStatus.error && (
                          <p className="text-xs text-red-500 mt-1 truncate">
                            {fileStatus.error.length > 50
                              ? `${fileStatus.error.substring(0, 50)}...`
                              : fileStatus.error}
                          </p>
                        )}
                      </div>
                    </div>

                    {!uploading && fileStatus.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {allCompleted && !hasErrors && (
            <div className="flex items-center gap-2 justify-center p-3 rounded-md bg-success/10 text-success-foreground">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-medium">
                All files uploaded successfully!
              </p>
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
            {allCompleted
              ? "Close"
              : files.length > 0 && !uploading
              ? "Back"
              : "Cancel"}
          </Button>

          {!allCompleted && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
            >
              {uploading
                ? `Uploading ${
                    files.filter((f) => f.status === "uploading").length
                  }/${files.length}...`
                : `Upload ${files.length} file${files.length !== 1 ? "s" : ""}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
