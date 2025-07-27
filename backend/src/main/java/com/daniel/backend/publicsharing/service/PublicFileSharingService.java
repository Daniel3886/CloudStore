package com.daniel.backend.publicsharing.service;

import com.daniel.backend.file.entity.Files;
import com.daniel.backend.file.repo.FileRepo;
import com.daniel.backend.file.service.StorageService;
import com.daniel.backend.publicsharing.entity.PublicFileAccessToken;
import com.daniel.backend.publicsharing.repo.PublicFileAccessTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PublicFileSharingService {

    @Autowired
    private FileRepo fileRepo;

    @Autowired
    private PublicFileAccessTokenRepository publicTokenRepo;

    @Autowired
    private StorageService storageService;

    public String generatePublicLink(Long fileId, String ownerEmail) throws AccessDeniedException {
        Files file = fileRepo.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getOwner().getEmail().equalsIgnoreCase(ownerEmail.trim())) {
            throw new AccessDeniedException("Only the owner can generate public link");
        }

        String token = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusHours(24);

        PublicFileAccessToken accessToken = PublicFileAccessToken.builder()
                .token(token)
                .file(file)
                .expiresAt(expiry)
                .active(true)
                .build();

        publicTokenRepo.save(accessToken);

        return "https://cloudstore.com/share/public/access/" + token;
    }

    public PublicFileResponse getPublicFileWithMetadata(String token) {
        Files file = validateAndGetFileFromToken(token);
        byte[] fileContent = storageService.downloadFile(file.getS3Key());
        return new PublicFileResponse(fileContent, file.getDisplayName());
    }

    public Files downloadPublicFile(String token) {
        return validateAndGetFileFromToken(token);
    }


    private Files validateAndGetFileFromToken(String token) {
        PublicFileAccessToken access = publicTokenRepo.findByTokenAndActiveTrue(token)
                .orElseThrow(() -> new RuntimeException("Invalid or inactive link"));

        if (access.getExpiresAt().isBefore(LocalDateTime.now())) {
            access.setActive(false);
            publicTokenRepo.save(access);
            throw new RuntimeException("Link has expired");
        }

        return access.getFile();
    }

    public record PublicFileResponse(byte[] content, String filename) {}
}
