package com.daniel.backend.file.service;

import com.daniel.backend.file.dto.S3ObjectDto;
import com.daniel.backend.file.entity.Files;
import com.daniel.backend.file.repo.FileRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StorageService {

    @Value("${AWS_BUCKET_NAME}")
    private String bucketName;

    @Autowired
    private S3Client s3Client;

    @Autowired
    private FileRepo fileRepo;

    public String uploadFile(MultipartFile file) {
        File fileObj = convertMultiPartFileToFile(file);

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            originalFileName = "unknown-file";
        }

        String folderPath = "";
        String actualFileName = originalFileName;

        if (originalFileName.contains("/")) {
            int lastSlashIndex = originalFileName.lastIndexOf("/");
            folderPath = originalFileName.substring(0, lastSlashIndex + 1);
            actualFileName = originalFileName.substring(lastSlashIndex + 1);
        }

        String timestampFileName = System.currentTimeMillis() + "-" + actualFileName;
        String s3Key = folderPath + timestampFileName;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build();
        s3Client.putObject(putObjectRequest, RequestBody.fromFile(fileObj));
        fileObj.delete();

        Files metadata = Files.builder()
                .s3Key(s3Key)
                .displayName(originalFileName)
                .ownerId(1L) // TODO: Replace with authenticated user ID
                .build();
        fileRepo.save(metadata);

        return "File uploaded successfully: " + s3Key;
    }

    public byte[] downloadFile(String fileName) {
        if(!doesFileExist(fileName)) {
            throw new RuntimeException("File not found: " + fileName);
        }
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .build();
        ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getObjectRequest);
        return objectBytes.asByteArray();
    }

    public String deleteFile(String fileName) {
        if(!doesFileExist(fileName)) {
            throw new RuntimeException("File not found: " + fileName);
        }
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .build();

        Files metadata = fileRepo.findByS3Key(fileName)
                .orElseThrow(() -> new RuntimeException("File metadata not found: " + fileName));
        fileRepo.delete(metadata);
        s3Client.deleteObject(deleteObjectRequest);

        return "File deleted successfully: " + fileName;
    }

    public void renameFolder(String oldFolderPath, String newFolderPath) {
        if (!oldFolderPath.endsWith("/")) {
            oldFolderPath += "/";
        }
        if (!newFolderPath.endsWith("/")) {
            newFolderPath += "/";
        }

        String finalOldFolderPath = oldFolderPath;
        List<Files> filesInFolder = fileRepo.findAll().stream()
                .filter(file -> file.getDisplayName().startsWith(finalOldFolderPath))
                .collect(Collectors.toList());

        System.out.println("Renaming folder from: " + oldFolderPath + " to: " + newFolderPath);
        System.out.println("Found " + filesInFolder.size() + " files to move");

        for (Files file : filesInFolder) {
            try {
                String oldS3Key = file.getS3Key();
                String oldDisplayName = file.getDisplayName();

                String newDisplayName = oldDisplayName.replace(oldFolderPath, newFolderPath);
                String newS3Key = oldS3Key.replace(oldFolderPath, newFolderPath);

                System.out.println("Moving file: " + oldS3Key + " -> " + newS3Key);

                CopyObjectRequest copyRequest = CopyObjectRequest.builder()
                        .sourceBucket(bucketName)
                        .sourceKey(oldS3Key)
                        .destinationBucket(bucketName)
                        .destinationKey(newS3Key)
                        .build();

                s3Client.copyObject(copyRequest);

                DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(oldS3Key)
                        .build();

                s3Client.deleteObject(deleteRequest);

                file.setS3Key(newS3Key);
                file.setDisplayName(newDisplayName);
                fileRepo.save(file);

                System.out.println("Successfully moved: " + oldS3Key + " -> " + newS3Key);

            } catch (Exception e) {
                System.err.println("Failed to move file: " + file.getS3Key() + " - " + e.getMessage());
                throw new RuntimeException("Failed to rename folder: " + e.getMessage());
            }
        }
    }

    public void deleteFolder(String folderPath) {
        if (!folderPath.endsWith("/")) {
            folderPath += "/";
        }

        String finalFolderPath = folderPath;
        List<Files> filesInFolder = fileRepo.findAll().stream()
                .filter(file -> file.getDisplayName().startsWith(finalFolderPath))
                .collect(Collectors.toList());

        System.out.println("Deleting folder: " + folderPath);
        System.out.println("Found " + filesInFolder.size() + " files to delete");

        for (Files file : filesInFolder) {
            try {
                String s3Key = file.getS3Key();
                System.out.println("Deleting file: " + s3Key);

                if (doesFileExist(s3Key)) {
                    DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(s3Key)
                            .build();

                    s3Client.deleteObject(deleteRequest);
                }

                fileRepo.delete(file);

                System.out.println("Successfully deleted: " + s3Key);

            } catch (Exception e) {
                System.err.println("Failed to delete file: " + file.getS3Key() + " - " + e.getMessage());
            }
        }
    }

    private boolean doesFileExist(String fileName) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .build();
            s3Client.getObject(getObjectRequest);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private File convertMultiPartFileToFile(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            originalFileName = "unknown-file";
        }

        String actualFileName = originalFileName;
        if (originalFileName.contains("/")) {
            actualFileName = originalFileName.substring(originalFileName.lastIndexOf("/") + 1);
        }

        String safeFilename = System.currentTimeMillis() + "-" + Paths.get(actualFileName).getFileName();
        File convertedFile = new File(System.getProperty("java.io.tmpdir"), safeFilename);
        try (FileOutputStream fos = new FileOutputStream(convertedFile)) {
            fos.write(file.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Could not convert multipart file to file: " + e.getMessage());
        }
        return convertedFile;
    }

    public List<S3ObjectDto> listObjects() {
        List<Files> dbFiles = fileRepo.findAll();

        ListObjectsV2Request request = ListObjectsV2Request.builder()
                .bucket(bucketName)
                .build();
        List<S3Object> s3Objects = s3Client.listObjectsV2(request).contents();

        Map<String, S3Object> s3ObjectMap = s3Objects.stream()
                .collect(Collectors.toMap(S3Object::key, obj -> obj));

        List<S3ObjectDto> dtos = new ArrayList<>();

        for (Files dbFile : dbFiles) {
            S3Object s3Object = s3ObjectMap.get(dbFile.getS3Key());
            if (s3Object != null) {
                S3ObjectDto dto = new S3ObjectDto(
                        dbFile.getS3Key(),
                        s3Object.size(),
                        s3Object.lastModified(),
                        dbFile.getDisplayName()
                );
                dtos.add(dto);
            }
        }

        return dtos;
    }

    public void renameFile(String s3Key, String newDisplayName) {
        Files metadata = fileRepo.findByS3Key(s3Key)
                .orElseThrow(() -> new RuntimeException("File not found"));
        metadata.setDisplayName(newDisplayName);
        fileRepo.save(metadata);
    }

    public String getDisplayName(String s3Key) {
        Files metadata = fileRepo.findByS3Key(s3Key)
                .orElseThrow(() -> new RuntimeException("File not found in metadata"));
        return metadata.getDisplayName();
    }
}
