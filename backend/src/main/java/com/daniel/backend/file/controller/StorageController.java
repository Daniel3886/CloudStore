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
import software.amazon.awssdk.services.s3.model.S3Object;

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

    @GetMapping("/download/{s3Key}")
    public ResponseEntity<ByteArrayResource> downloadFile(@PathVariable String s3Key) {
        byte[] data = service.downloadFile(s3Key);  // s3Key = timestamp-prefixed key
        String displayName = service.getDisplayName(s3Key); // from DB

        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + displayName + "\"")
                .header(HttpHeaders.CONTENT_TYPE, "application/octet-stream")
                .body(new ByteArrayResource(data));
    }

    @DeleteMapping("/delete/{fileName}")
    public ResponseEntity<String> deleteFile(@PathVariable String fileName) {
        return new ResponseEntity<>(service.deleteFile(fileName), HttpStatus.OK);
    }

    @GetMapping("/list")
    public List<S3ObjectDto> listObjects() {
        return service.listObjects();
    }

    @PatchMapping("/rename")
    public ResponseEntity<String> renameFile(
            @RequestParam String s3Key,
            @RequestParam String newDisplayName
    ) {
        service.renameFile(s3Key, newDisplayName);
        return ResponseEntity.ok("Renamed successfully");
    }
}
