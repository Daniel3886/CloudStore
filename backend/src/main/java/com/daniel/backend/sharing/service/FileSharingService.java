package com.daniel.backend.sharing.service;

import com.daniel.backend.auth.entity.Users;
import com.daniel.backend.auth.repository.UserRepo;
import com.daniel.backend.file.entity.Files;
import com.daniel.backend.file.repo.FileRepo;
import com.daniel.backend.sharing.dto.ShareFileRequestDto;
import com.daniel.backend.sharing.dto.SharedFileDto;
import com.daniel.backend.sharing.entity.FilePermission;
import com.daniel.backend.sharing.repository.FilePermissionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Optional;

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

        if (!file.getOwner().getEmail().equals(currentUserEmail)) {
            throw new AccessDeniedException("You are the owner of this file");
        }

        if (dto.getTargetUserEmail().equals(currentUserEmail)) {
            throw new AccessDeniedException("You cannot share the file with yourself\"");
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

    public List<SharedFileDto> getFilesSharedWithUser(String currentUserEmail) {
        List<FilePermission> permissions = filePermissionRepo.findBySharedWithEmail(currentUserEmail);

        return permissions.stream().map(permission -> {
            Files file = permission.getFile();
            return new SharedFileDto(
                    file.getId(),
                    file.getDisplayName(),
                    file.getOwner().getEmail(),
                    file.getS3Key()
            );
        }).toList();
    }

    public List<String> getUsersFileIsSharedWith(Long fileId, String ownerEmail) throws AccessDeniedException {
        Files file = fileRepo.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (file.getOwner() == null || file.getOwner().getEmail() == null ||
                !file.getOwner().getEmail().equalsIgnoreCase(ownerEmail.trim())) {
            throw new AccessDeniedException("You do not own this file");
        }


        return filePermissionRepo.findByFileId(fileId)
                .stream()
                .map(fp -> fp.getSharedWith().getEmail())
                .toList();
    }

    public void revokeAccess(Long fileId, String targetEmail, String ownerEmail) throws AccessDeniedException {
        Files file = fileRepo.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (file.getOwner() == null || file.getOwner().getEmail() == null ||
                !file.getOwner().getEmail().equalsIgnoreCase(ownerEmail.trim())) {
            throw new AccessDeniedException("Only the owner can revoke access");
        }

        List<FilePermission> permissions = filePermissionRepo
                .findAllByFileIdAndSharedWithEmail(fileId, targetEmail);

        if (permissions.isEmpty()) {
            throw new RuntimeException("User does not have access to this file");
        }

        filePermissionRepo.deleteAll(permissions);
    }


}
