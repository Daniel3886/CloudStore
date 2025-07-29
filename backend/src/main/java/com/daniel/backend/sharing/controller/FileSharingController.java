package com.daniel.backend.sharing.controller;

import com.daniel.backend.sharing.dto.MessageUpdateRequestDto;
import com.daniel.backend.sharing.dto.ShareFileRequestDto;
import com.daniel.backend.sharing.dto.SharedFileDto;
import com.daniel.backend.sharing.service.FileSharingService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/share")
@RequiredArgsConstructor
public class FileSharingController {

    @Autowired
    private FileSharingService fileSharingService;

    @PostMapping
    public ResponseEntity<?> shareFile(@RequestBody ShareFileRequestDto dto, HttpServletRequest request) {
        try {
            String currentUserEmail = request.getUserPrincipal().getName();
            fileSharingService.shareFile(dto, currentUserEmail);
            return ResponseEntity.ok("File shared successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Sharing failed: " + e.getMessage());
        }
    }

    @GetMapping("/received")
    public ResponseEntity<?> getFilesSharedWithUser(HttpServletRequest request) {
        try {
            String currentUserEmail = request.getUserPrincipal().getName();
            List<SharedFileDto> files = fileSharingService.getFilesSharedWithUser(currentUserEmail);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Could not fetch shared files: " + e.getMessage());
        }
    }

    @GetMapping("/{fileId}/users")
    public ResponseEntity<?> getUsersFileIsSharedWith(@PathVariable Long fileId, HttpServletRequest request) {
        try {
            String currentUserEmail = request.getUserPrincipal().getName();
            List<String> sharedUsers = fileSharingService.getUsersFileIsSharedWith(fileId, currentUserEmail);
            return ResponseEntity.ok(sharedUsers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Could not fetch shared users: " + e.getMessage());
        }
    }

    @DeleteMapping("/{fileId}/user/{email}")
    public ResponseEntity<?> revokeFileAccess(
            @PathVariable Long fileId,
            @PathVariable String email,
            HttpServletRequest request) {
        try {
            String currentUserEmail = request.getUserPrincipal().getName();
            fileSharingService.revokeAccess(fileId, email, currentUserEmail);
            return ResponseEntity.ok("Access revoked for user: " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to revoke access: " + e.getMessage());
        }
    }

    @PutMapping("/{fileId}/shared/{targetUserId}/message")
    public ResponseEntity<?> updateMessage(
            @PathVariable Long fileId,
            @PathVariable Long targetUserId,
            @RequestBody MessageUpdateRequestDto request,
            HttpServletRequest httpRequest
    ) {
        try {
            String currentUserEmail = httpRequest.getUserPrincipal().getName();
            fileSharingService.updateMessage(fileId, targetUserId, currentUserEmail, request.getMessage());
            return ResponseEntity.ok("Message updated");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update message: " + e.getMessage());
        }
    }

    @DeleteMapping("/{fileId}/user/{email}/message")
    public ResponseEntity<?> removePunchcardMessage(
            @PathVariable Long fileId,
            @PathVariable String email,
            HttpServletRequest request) {
        try {
            String currentUserEmail = request.getUserPrincipal().getName();
            fileSharingService.removeMessage(fileId, email, currentUserEmail);
            return ResponseEntity.ok("Message removed successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to remove message: " + e.getMessage());
        }
    }


}
