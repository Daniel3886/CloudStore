package com.daniel.backend.sharing.repository;


import com.daniel.backend.sharing.entity.FilePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FilePermissionRepo extends JpaRepository<FilePermission, Long> {

    List<FilePermission> findBySharedWithEmail(String email);
}