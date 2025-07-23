package com.daniel.backend.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private boolean verified = false;

    private String verificationCode;
    private LocalDateTime lastVerificationEmailSentAt;
    private LocalDateTime verificationCodeExpiresAt;

    @Column(name = "password_reset_token")
    private String passwordResetToken;
    @Column(name = "password_reset_expires_at")
    private LocalDateTime passwordResetExpiresAt;
}
