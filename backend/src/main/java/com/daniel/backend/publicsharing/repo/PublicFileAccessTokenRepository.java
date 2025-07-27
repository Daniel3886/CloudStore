package com.daniel.backend.publicsharing.repo;

import com.daniel.backend.publicsharing.entity.PublicFileAccessToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PublicFileAccessTokenRepository extends JpaRepository<PublicFileAccessToken, Long> {
    Optional<PublicFileAccessToken> findByTokenAndActiveTrue(String token);
}
