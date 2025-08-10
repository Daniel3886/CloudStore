package com.daniel.backend.publicsharing.repo;

import com.daniel.backend.publicsharing.entity.PublicFileAccessToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PublicFileAccessTokenRepo extends JpaRepository<PublicFileAccessToken, Long> {
    Optional<PublicFileAccessToken> findByTokenAndActiveTrue(String token);

    List<PublicFileAccessToken> findAllByFileOwnerEmailAndActiveTrue(String ownerEmail);
}