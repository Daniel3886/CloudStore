package com.daniel.backend.file.service;

import com.daniel.backend.auth.entity.Users;
import com.daniel.backend.auth.repository.UserRepo;
import com.daniel.backend.file.entity.Files;
import com.daniel.backend.file.entity.VirtualFolder;
import com.daniel.backend.file.repo.FileRepo;
import com.daniel.backend.file.repo.VirtualFolderRepo;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class VirtualFolderService {

    @Autowired
    private VirtualFolderRepo virtualFolderRepo;

    @Autowired
    private StorageService storageService;

    @Autowired
    private FileRepo fileRepo;

    @Autowired
    private UserRepo userRepo;


    public VirtualFolder createFolder(String name, String ownerEmail) {
        Users owner = userRepo.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (virtualFolderRepo.findByOwnerAndName(owner, name).isPresent()) {
            throw new IllegalArgumentException("Folder with this name already exists");
        }

        VirtualFolder folder = new VirtualFolder();
        folder.setName(name);
        folder.setOwner(owner);

        return virtualFolderRepo.save(folder);
    }

    public VirtualFolder renameFolder(Long id, String newName, String ownerEmail) {

        Users owner = userRepo.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (newName.isBlank()) throw new IllegalArgumentException("New name cannot be empty");
        if (newName.length() > 100) throw new IllegalArgumentException("Folder name too long");

        VirtualFolder folder = virtualFolderRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found"));


        folder.setName(newName);

        return virtualFolderRepo.save(folder);
    }

    public void deleteFolder(Long folderId, String ownerEmail) {
        VirtualFolder folder = virtualFolderRepo.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found"));

        if(!folder.getOwner().getEmail().equals(ownerEmail)) {
            throw new IllegalArgumentException("You do not own this folder");
        }

        virtualFolderRepo.delete(folder);
    }

    public Files addFileToFolder(Long folderId, Long fileId, String ownerEmail) {
        Files file = fileRepo.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found"));

        VirtualFolder folder = virtualFolderRepo.findById(folderId)
                        .orElseThrow(() -> new IllegalArgumentException("Folder not found"));

        if(!file.getOwner().getEmail().equals(ownerEmail)
        || !folder.getOwner().getEmail().equals(ownerEmail)) {
            throw new IllegalArgumentException("You do not own this folder/file");
        }

        if(file.getFolder() != null) {
            throw new IllegalArgumentException("File is already in a folder");
        }

        file.setFolder(folder);
        return fileRepo.save(file);

    }

    public Files removeFileFromFolder(Long folderId, Long fileId, String ownerEmail) {
        Files file = fileRepo.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found"));

        if(!file.getOwner().getEmail().equals(ownerEmail)) {
            throw new IllegalArgumentException("You do not own this file");
        }

        if (file.getFolder() == null || !file.getFolder().getFolderId().equals(folderId)) {
            throw new IllegalArgumentException("File is not in this folder");
        }

        file.setFolder(null);

        return fileRepo.save(file);
    }


    public List<VirtualFolder> listUserFolders(String ownerEmail) {
        Users owner = userRepo.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return virtualFolderRepo.findByOwner(owner);
    }

    public void downloadFolderAsZip(Long folderId, HttpServletResponse response) {
        VirtualFolder folder = virtualFolderRepo.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found"));

        List<Files> filesInFolder = fileRepo.findByFolder(folder);

        if (filesInFolder.isEmpty()) {
            throw new IllegalArgumentException("Folder is empty");
        }

        try {
            response.setContentType("application/zip");
            response.setHeader(
                    "Content-Disposition",
                    "attachment; filename=\"" + folder.getName() + ".zip\""
            );

            try (ZipOutputStream zipOut = new ZipOutputStream(response.getOutputStream())) {

                for (Files file : filesInFolder) {
                    try (InputStream fileStream = storageService.downloadFile(file.getS3Key())) {
                        ZipEntry zipEntry = new ZipEntry(file.getDisplayName());
                        zipOut.putNextEntry(zipEntry);

                        fileStream.transferTo(zipOut);

                        zipOut.closeEntry();
                    }
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to create zip for folder " + folder.getName(), e);
        }
    }
}
