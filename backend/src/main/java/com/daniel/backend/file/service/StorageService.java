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
        String fileName = System.currentTimeMillis() + "-" + file.getOriginalFilename();

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromFile(fileObj));
        fileObj.delete();

        Files metadata = Files.builder()
                .s3Key(fileName)
                .displayName(file.getOriginalFilename())
                .ownerId(1L) // TODO: Replace with authenticated user ID
                .build();

        fileRepo.save(metadata);

        return "File uploaded successfully: " + fileName;
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
        String safeFilename = System.currentTimeMillis() + "-" + Paths.get(file.getOriginalFilename()).getFileName();
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

        for (Files file : dbFiles) {
            S3Object S3Object = s3ObjectMap.get(file.getS3Key());

            if (S3Object != null) {
                dtos.add(new S3ObjectDto(
                        file.getS3Key(),
                        S3Object.size(),
                        S3Object.lastModified(),
                        file.getDisplayName()
                ));
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
