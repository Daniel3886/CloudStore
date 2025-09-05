package com.daniel.backend.file.repo;

import com.daniel.backend.auth.entity.Users;
import com.daniel.backend.file.entity.Files;
import com.daniel.backend.file.entity.VirtualFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepo extends JpaRepository<Files, Long> {

    Optional<Files> findByS3Key(String s3Key);
    List<Files> findByOwner_EmailAndDeletedAtIsNull(String ownerEmail);
    List<Files> findByOwner_EmailAndDeletedAtIsNotNull(String ownerEmail);
    List<Files> findByFolder(VirtualFolder folder);
}

