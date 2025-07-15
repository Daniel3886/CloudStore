// FileSharingService.java
package com.daniel.backend.sharing.service;

import com.daniel.backend.auth.entity.Users;
import com.daniel.backend.auth.repository.UserRepo;
import com.daniel.backend.file.entity.Files;
import com.daniel.backend.file.repo.FileRepo;
import com.daniel.backend.sharing.dto.ShareFileRequestDto;
import com.daniel.backend.sharing.entity.FilePermission;
import com.daniel.backend.sharing.repository.FilePermissionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;

@Service
public class FileSharingService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private FileRepo fileRepo;

    @Autowired
    private FilePermissionRepo filePermissionRepo;

    public void shareFile(ShareFileRequestDto dto, String currentUserEmail) throws AccessDeniedException {
        Files file = fileRepo.findById(dto.getFileId())
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getOwnerEmail().equals(currentUserEmail)) {
            throw new AccessDeniedException("You are not the owner of this file");
        }

        Users targetUser = userRepo.findByEmail(dto.getTargetUserEmail())
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        FilePermission permission = FilePermission.builder()
                .file(file)
                .sharedWith(targetUser)
                .permissionType(dto.getPermissionType())
                .build();

        filePermissionRepo.save(permission);
    }
}
