package com.daniel.backend.file.repo;

import com.daniel.backend.auth.entity.Users;
import com.daniel.backend.file.entity.VirtualFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VirtualFolderRepo extends JpaRepository<VirtualFolder, Long> {

    List<VirtualFolder> findByOwner(Users owner);

    Optional<VirtualFolder> findByOwnerAndName(Users owner, String name);
}
