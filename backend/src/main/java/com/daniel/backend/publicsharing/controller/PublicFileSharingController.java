package com.daniel.backend.publicsharing.controller;

import com.daniel.backend.publicsharing.service.PublicFileSharingService;
import com.daniel.backend.publicsharing.service.PublicFileSharingService.PublicFileResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;

@RestController
@RequestMapping("/share/public")
@RequiredArgsConstructor
public class PublicFileSharingController {

    private final PublicFileSharingService publicSharingService;


    @PostMapping("/{fileId}")
    public ResponseEntity<?> generatePublicLink(@PathVariable Long fileId, HttpServletRequest request) throws AccessDeniedException {
        String currentUserEmail = request.getUserPrincipal().getName();
        String url = publicSharingService.generatePublicLink(fileId, currentUserEmail);
        return ResponseEntity.ok(url);
    }

    @GetMapping("/access/{token}")
    public ResponseEntity<byte[]> downloadPublicFile(@PathVariable String token) {
        try {
            PublicFileResponse response = publicSharingService.getPublicFileWithMetadata(token);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + response.filename() + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(response.content());

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @DeleteMapping("/access/{token}")
    public ResponseEntity<?> revokePublicLink(@PathVariable String token, HttpServletRequest request) throws AccessDeniedException {
        String ownerEmail = request.getUserPrincipal().getName();
        publicSharingService.revokeToken(token, ownerEmail);
        return ResponseEntity.ok("Public access link revoked.");
    }


    @GetMapping("/list")
    public ResponseEntity<?> getAllActiveLinks(HttpServletRequest request) {
        String ownerEmail = request.getUserPrincipal().getName();
        return ResponseEntity.ok(publicSharingService.getActiveLinksByOwner(ownerEmail));
    }

}
