package com.daniel.backend.file.repo;

import com.daniel.backend.file.entity.Files;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FileRepo extends JpaRepository<Files, Long> {
    Optional<Files> findByS3Key(String s3Key);
    Optional<Files> findById(Long id);

}
