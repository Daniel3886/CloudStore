package com.daniel.backend.file.service;

import com.daniel.backend.file.dto.S3ObjectDto;
import com.daniel.backend.file.entity.Files;
import com.daniel.backend.file.repo.FileRepo;
import org.junit.jupiter.api.Test;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.S3Object;

import java.lang.reflect.Proxy;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class StorageServiceTrashTest {

    @Test
    void listTrashedFilesIncludesDeletionAndPurgeDates() {
        LocalDateTime deletedAt = LocalDateTime.of(2026, 11, 20, 10, 30);
        Files trashed = Files.builder()
                .id(7L)
                .s3Key("owner/report.pdf")
                .displayName("reports/report.pdf")
                .isDeleted(true)
                .deletedAt(deletedAt)
                .build();

        StorageService service = new StorageService(s3ClientWith("owner/report.pdf"), fileRepoReturning(List.of(trashed)), null, null, null);

        List<S3ObjectDto> result = service.listTrashedFiles("owner@example.com");

        assertEquals(1, result.size());
        S3ObjectDto dto = result.get(0);
        Instant expectedDeletedAt = deletedAt.atZone(ZoneId.systemDefault()).toInstant();
        assertEquals(expectedDeletedAt, dto.getDeletedAt());
        assertEquals(expectedDeletedAt.plus(Duration.ofDays(AutoCleanupService.TRASH_RETENTION_DAYS)), dto.getPurgeAt());
        assertEquals("reports/report.pdf", dto.getDisplayName());
    }

    private static S3Client s3ClientWith(String key) {
        S3Object object = S3Object.builder().key(key).size(1024L).lastModified(Instant.parse("2026-11-01T00:00:00Z")).build();
        return (S3Client) Proxy.newProxyInstance(
                S3Client.class.getClassLoader(),
                new Class<?>[]{S3Client.class},
                (proxy, method, args) -> {
                    if (method.getName().equals("listObjectsV2")) {
                        return ListObjectsV2Response.builder().contents(object).build();
                    }
                    throw new UnsupportedOperationException(method.getName());
                });
    }

    private static FileRepo fileRepoReturning(List<Files> trashed) {
        return (FileRepo) Proxy.newProxyInstance(
                FileRepo.class.getClassLoader(),
                new Class<?>[]{FileRepo.class},
                (proxy, method, args) -> {
                    if (method.getName().equals("findByOwnerEmailAndDeletedAtIsNotNull")) {
                        return trashed;
                    }
                    throw new UnsupportedOperationException(method.getName());
                });
    }
}
