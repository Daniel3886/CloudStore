package com.daniel.backend.sharing.repository;


import com.daniel.backend.auth.entity.Users;
import com.daniel.backend.sharing.entity.FilePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FilePermissionRepo extends JpaRepository<FilePermission, Long> {

    List<FilePermission> findBySharedWith(Users user);

    Optional<FilePermission> findByFileIdAndSharedWithId(Long fileId, Long userId);
}