package com.daniel.backend.file.controller;

import com.daniel.backend.file.dto.S3ObjectDto;
import com.daniel.backend.file.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/file")
public class StorageController {

    @Autowired
    private StorageService service;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam MultipartFile file) {
        return new ResponseEntity<>(service.uploadFile(file), HttpStatus.OK);
    }

    @GetMapping("/download")
    public ResponseEntity<ByteArrayResource> downloadFile(@RequestParam String s3Key) {
        try {
            byte[] data = service.downloadFile(s3Key);
            String displayName = service.getDisplayName(s3Key);

            String downloadFileName = displayName;
            if (displayName.contains("/")) {
                downloadFileName = displayName.substring(displayName.lastIndexOf("/") + 1);
            }

            return ResponseEntity
                    .ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadFileName + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, "application/octet-stream")
                    .body(new ByteArrayResource(data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteFile(@RequestParam String fileName) {
        try {
            return new ResponseEntity<>(service.deleteFile(fileName), HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Delete failed: " + e.getMessage());
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<S3ObjectDto>> listObjects() {
        try {
            List<S3ObjectDto> files = service.listObjects();
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PatchMapping("/rename")
    public ResponseEntity<String> renameFile(
            @RequestParam String s3Key,
            @RequestParam String newDisplayName
    ) {
        try {
            service.renameFile(s3Key, newDisplayName);
            return ResponseEntity.ok("Renamed successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Rename failed: " + e.getMessage());
        }
    }

    @PatchMapping("/rename-folder")
    public ResponseEntity<String> renameFolder(
            @RequestParam String oldFolderPath,
            @RequestParam String newFolderPath
    ) {
        try {
            service.renameFolder(oldFolderPath, newFolderPath);
            return ResponseEntity.ok("Folder renamed successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Folder rename failed: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete-folder")
    public ResponseEntity<String> deleteFolder(@RequestParam String folderPath) {
        try {
            service.deleteFolder(folderPath);
            return ResponseEntity.ok("Folder deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Folder delete failed: " + e.getMessage());
        }
    }
}
