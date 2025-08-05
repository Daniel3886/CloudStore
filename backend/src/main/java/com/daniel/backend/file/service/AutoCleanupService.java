package com.daniel.backend.file.service;

import com.daniel.backend.file.repo.FileRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AutoCleanupService {

    @Autowired
    private FileRepo fileRepo;

    @Autowired
    private StorageService storageService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanTrashedFiles() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        var filesToDelete = fileRepo.findAll().stream()
                .filter(file -> file.getDeletedAt() != null && file.getDeletedAt().isBefore(cutoff))
                .toList();

        for (var file : filesToDelete) {
            try {
                storageService.permanentlyDeleteFile(file.getS3Key());
            } catch (Exception e) {
                System.err.println("Failed to permanently delete file: " + file.getS3Key());
            }
        }
    }
}
