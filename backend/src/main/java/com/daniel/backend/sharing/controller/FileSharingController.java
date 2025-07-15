package com.daniel.backend.sharing.controller;

import com.daniel.backend.sharing.dto.ShareFileRequestDto;
import com.daniel.backend.sharing.service.FileSharingService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
