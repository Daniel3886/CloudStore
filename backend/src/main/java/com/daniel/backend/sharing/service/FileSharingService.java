package com.daniel.backend.sharing.service;

import com.daniel.backend.audit.service.AuditLogService;
import com.daniel.backend.auth.entity.Users;
import com.daniel.backend.auth.repository.UserRepo;
import com.daniel.backend.file.entity.Files;
import com.daniel.backend.file.repo.FileRepo;
import com.daniel.backend.sharing.dto.ShareFileRequestDto;
import com.daniel.backend.sharing.dto.SharedFileDto;
import com.daniel.backend.sharing.entity.FilePermission;
import com.daniel.backend.sharing.repository.FilePermissionRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FileSharingService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private FileRepo fileRepo;

    @Autowired
    private FilePermissionRepo filePermissionRepo;

    @Autowired
    private AuditLogService auditLogService;


    public void shareFile(ShareFileRequestDto dto, String senderEmail) throws AccessDeniedException {
        Files file = fileRepo.findById(dto.getFileId())
                .orElseThrow(() -> new AccessDeniedException("File not found"));

        Users sender = userRepo.findByEmail(senderEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Users recipient = userRepo.findByEmail(dto.getTargetUserEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Recipient not found"));

        if (sender.getEmail().equals(recipient.getEmail())) {
            throw new IllegalArgumentException("You cannot share a file with yourself.");
        }

        auditLogService.log(
                "SHARE_FILE",
                sender.getEmail(),
                file,
                "Shared file with " + recipient.getEmail()
        );


        FilePermission permission = new FilePermission();
        permission.setFile(file);
        permission.setSharedWith(recipient);
        permission.setPermissionType(dto.getPermissionType());
        permission.setMessage(dto.getMessage());
        permission.setSharedAt(LocalDateTime.now());

        filePermissionRepo.save(permission);
    }


    public List<SharedFileDto> getFilesSharedWithUser(String currentUserEmail) {
        List<FilePermission> permissions = filePermissionRepo.findBySharedWithEmail(currentUserEmail);

        return permissions.stream().map(permission -> {
            Files file = permission.getFile();
            return SharedFileDto.builder()
                    .fileId(file.getId())
                    .displayName(file.getDisplayName())
                    .sharedBy(file.getOwner().getEmail())
                    .s3Key(file.getS3Key())
                    .message(permission.getMessage())
                    .sharedAt(permission.getSharedAt())
                    .build();
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

        auditLogService.log(
                "REVOKE_ACCESS",
                ownerEmail,
                file,
                "Revoked access from " + targetEmail
        );


        filePermissionRepo.deleteAll(permissions);
    }


    public void updateMessage(Long fileId, Long targetUserId, String currentUserEmail, String newMessage) throws AccessDeniedException {
        Files file = fileRepo.findById(fileId)
                .orElseThrow(() -> new EntityNotFoundException("File not found"));

        if (!file.getOwner().getEmail().equals(currentUserEmail)) {
            throw new AccessDeniedException("Only the file owner can edit the message");
        }

        Users receiver = userRepo.findById(targetUserId)
                .orElseThrow(() -> new EntityNotFoundException("Target user not found"));

        FilePermission permission = filePermissionRepo
                .findByFileAndSharedWith(file, receiver)
                .orElseThrow(() -> new EntityNotFoundException("Sharing relationship not found"));

        auditLogService.log(
                "UPDATE_MESSAGE",
                currentUserEmail,
                file,
                "Updated message for user ID " + targetUserId
        );


        permission.setMessage(newMessage);
        filePermissionRepo.save(permission);
    }


    public void removeMessage(Long fileId, String targetEmail, String currentUserEmail) throws AccessDeniedException {
        Users targetUser = userRepo.findByEmail(targetEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Files file = fileRepo.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found"));

        FilePermission permission = filePermissionRepo
                .findByFileAndSharedWith(file, targetUser)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found"));

        boolean isOwner = file.getOwner().getEmail().equals(currentUserEmail);
        boolean isReceiver = targetEmail.equals(currentUserEmail);

        if (!isOwner && !isReceiver) {
            throw new AccessDeniedException("You are not authorized to remove this message.");
        }

        auditLogService.log(
                "REMOVE_MESSAGE",
                currentUserEmail,
                file,
                "Removed message for " + targetEmail
        );


        permission.setMessage(null);
        filePermissionRepo.save(permission);
    }
}
