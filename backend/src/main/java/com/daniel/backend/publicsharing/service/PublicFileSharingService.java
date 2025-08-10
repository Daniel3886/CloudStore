package com.daniel.backend.publicsharing.service;

import com.daniel.backend.audit.service.AuditLogService;
import com.daniel.backend.file.entity.Files;
import com.daniel.backend.file.repo.FileRepo;
import com.daniel.backend.file.service.StorageService;
import com.daniel.backend.publicsharing.entity.PublicFileAccessToken;
import com.daniel.backend.publicsharing.repo.PublicFileAccessTokenRepo;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.http.MediaType;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PublicFileSharingService {

    @Autowired
    private FileRepo fileRepo;

    @Autowired
    private PublicFileAccessTokenRepo publicTokenRepo;

    @Autowired
    private StorageService storageService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private S3Client s3Client;

    @Value("${AWS_BUCKET_NAME}")
    private String bucketName;

    public Map<String, String> generatePublicLink(Long fileId, String ownerEmail, HttpServletRequest request) throws AccessDeniedException {
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

        String baseUrl = String.format("%s://%s%s/share/public/access/%s",
                request.getScheme(),
                request.getServerName(),
                request.getServerPort() == 80 || request.getServerPort() == 443 ? "" : ":" + request.getServerPort(),
                token
        );

        return Map.of(
                "previewLink", baseUrl + "?preview=true",
                "downloadLink", baseUrl
        );
    }


    public PublicFileResponse getPublicFileWithMetadata(String token) {
        PublicFileAccessToken accessToken = publicTokenRepo.findByTokenAndActiveTrue(token)
                .orElseThrow(() -> new RuntimeException("Invalid or inactive public link."));

        if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            accessToken.setActive(false);
            publicTokenRepo.save(accessToken);
            throw new RuntimeException("This link has expired.");
        }

        Files file = accessToken.getFile();
        byte[] fileContent = storageService.downloadFile(file.getS3Key());
        MediaType mediaType = getFileMediaType(file.getS3Key());

        auditLogService.log(
                "PUBLIC_FILE_ACCESS",
                "anonymous",
                file.getId().toString(),
                "File accessed via public link"
        );

        return new PublicFileResponse(fileContent, file.getDisplayName(), mediaType);
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

    private MediaType getFileMediaType(String s3Key) {
        try {
            String contentType = s3Client.headObject(HeadObjectRequest.builder()
                            .bucket(bucketName)
                            .key(s3Key)
                            .build())
                    .contentType();

            if (contentType != null && !contentType.isBlank()) {
                return MediaType.parseMediaType(contentType);
            }
        } catch (Exception e) {
            System.err.println("Error retrieving content type for file: " + s3Key + " - " + e.getMessage());
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    public record PublicFileResponse(byte[] content, String filename, MediaType mediaType) {}
}
