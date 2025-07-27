package com.daniel.backend.sharing.repository;

import com.daniel.backend.sharing.entity.FilePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface FilePermissionRepo extends JpaRepository<FilePermission, Long> {

    List<FilePermission> findBySharedWithEmail(String email);

    List<FilePermission> findByFileId(Long fileId);

    List<FilePermission> findAllByFileIdAndSharedWithEmail(Long fileId, String email);

}