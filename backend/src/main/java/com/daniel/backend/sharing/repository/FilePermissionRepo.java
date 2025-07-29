package com.daniel.backend.sharing.repository;

import com.daniel.backend.auth.entity.Users;
import com.daniel.backend.file.entity.Files;
import com.daniel.backend.sharing.entity.FilePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface FilePermissionRepo extends JpaRepository<FilePermission, Long> {

    List<FilePermission> findBySharedWithEmail(String email);

    List<FilePermission> findByFileId(Long fileId);

    List<FilePermission> findAllByFileIdAndSharedWithEmail(Long fileId, String email);

    Optional<FilePermission> findByFileAndSharedWith(Files file, Users receiver);
}