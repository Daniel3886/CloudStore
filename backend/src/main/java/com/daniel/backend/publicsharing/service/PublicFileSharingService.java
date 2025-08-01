package com.daniel.backend.publicsharing.service;

import com.daniel.backend.audit.service.AuditLogService;
import com.daniel.backend.file.entity.Files;
import com.daniel.backend.file.repo.FileRepo;
import com.daniel.backend.file.service.StorageService;
import com.daniel.backend.publicsharing.entity.PublicFileAccessToken;
import com.daniel.backend.publicsharing.repo.PublicFileAccessTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PublicFileSharingService {

    @Autowired
    private FileRepo fileRepo;

    @Autowired
    private PublicFileAccessTokenRepository publicTokenRepo;

    @Autowired
    private StorageService storageService;

    @Autowired
    private AuditLogService auditLogService;


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

        auditLogService.log(
                "PUBLIC_LINK_GENERATION",
                ownerEmail,
                file.getId().toString(),
                "Generated a public link " + ownerEmail
        );


        publicTokenRepo.save(accessToken);

        return "https://cloudstore.com/share/public/access/" + token;
    }

    public PublicFileResponse getPublicFileWithMetadata(String token) {
        Files file = validateAndGetToken(token).getFile();
        byte[] fileContent = storageService.downloadFile(file.getS3Key());

        auditLogService.log(
                "PUBLIC_FILE_ACCESS",
                "anonymous",
                file.getId().toString(),
                "File accessed via public link"
        );

        return new PublicFileResponse(fileContent, file.getDisplayName());
    }

    public List<PublicFileAccessToken> getActiveLinksByOwner(String ownerEmail) {
        return publicTokenRepo.findAllByFileOwnerEmailAndActiveTrue(ownerEmail);
    }

    public void revokeToken(String token, String requesterEmail) throws AccessDeniedException {
        PublicFileAccessToken accessToken = validateAndGetToken(token);

        if (!accessToken.getFile().getOwner().getEmail().equalsIgnoreCase(requesterEmail.trim())) {
            throw new AccessDeniedException("Only the owner can revoke this link.");
        }

        auditLogService.log(
                "PUBLIC_LINK_REVOCATION",
                requesterEmail,
                accessToken.getFile().getId().toString(),
                "Revoked a public link"
        );

        accessToken.setActive(false);
        publicTokenRepo.save(accessToken);
    }

    private PublicFileAccessToken validateAndGetToken(String token) {
        PublicFileAccessToken access = publicTokenRepo.findByTokenAndActiveTrue(token)
                .orElseThrow(() -> new RuntimeException("Invalid or inactive public link."));

        if (access.getExpiresAt().isBefore(LocalDateTime.now())) {
            access.setActive(false);
            publicTokenRepo.save(access);
            throw new RuntimeException("This link has expired.");
        }

        return access;
    }

    public record PublicFileResponse(byte[] content, String filename) {}
}
