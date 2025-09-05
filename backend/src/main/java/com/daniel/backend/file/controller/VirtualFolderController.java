package com.daniel.backend.file.controller;

import com.daniel.backend.file.entity.Files;
import com.daniel.backend.file.entity.VirtualFolder;
import com.daniel.backend.file.service.VirtualFolderService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/folders")
public class VirtualFolderController {

    @Autowired
    private VirtualFolderService virtualFolderService;

    @GetMapping("/{id}/download")
    public void downloadFolder(@PathVariable Long id, HttpServletResponse response) {
        virtualFolderService.downloadFolderAsZip(id, response);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createFolder(@RequestParam String name, Authentication auth) {
        String email = auth.getName();
        VirtualFolder folder = virtualFolderService.createFolder(name, email);
        return ResponseEntity.ok(folder);
    }

    @PatchMapping("/{id}/rename")
    public ResponseEntity<?> renameFolder(
            @PathVariable Long id,
            @RequestParam String newName,
            Authentication auth
    ) {
        String email = auth.getName();
        VirtualFolder folder = virtualFolderService.renameFolder(id, newName, email);
        return ResponseEntity.ok(folder);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFolder(@PathVariable Long id, Authentication auth) {
        String email = auth.getName();
        virtualFolderService.deleteFolder(id, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<VirtualFolder>> listUserFolders(Authentication auth) {
        String email = auth.getName();
        List<VirtualFolder> folders = virtualFolderService.listUserFolders(email);
        return ResponseEntity.ok(folders);
    }


    @PostMapping("/{folderId}/add-file/{fileId}")
    public ResponseEntity<Files> addFileToFolder(
            @PathVariable Long folderId,
            @PathVariable Long fileId,
            Authentication auth
    ) {
        String email = auth.getName();
        Files file = virtualFolderService.addFileToFolder(folderId, fileId, email);
        return ResponseEntity.ok(file);
    }

    @DeleteMapping("/{folderId}/remove-file/{fileId}")
    public ResponseEntity<Files> removeFileFromFolder(
            @PathVariable Long folderId,
            @PathVariable Long fileId,
            Authentication auth
    ) {
        String email = auth.getName();
        Files file = virtualFolderService.removeFileFromFolder(folderId, fileId, email);
        return ResponseEntity.ok(file);
    }
}
