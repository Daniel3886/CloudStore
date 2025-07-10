package com.daniel.backend.file.repo;

import com.daniel.backend.file.entity.Files;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FileRepo extends JpaRepository<Files, Long> {
    Optional<Files> findByS3Key(String s3Key);
}
