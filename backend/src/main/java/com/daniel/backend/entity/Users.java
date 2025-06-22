package com.daniel.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "users")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.VIEWER;

    @Column(nullable = false)
    private boolean verified = false;

    private String verificationCode;
    private LocalDateTime lastVerificationEmailSentAt;
    private LocalDateTime verificationCodeExpiresAt;

    @Column(name = "password_reset_token")
    private String passwordResetToken;
    @Column(name = "password_reset_expires_at")
    private LocalDateTime passwordResetExpiresAt;

    public Users() {}

    public Users(int id, String username, String password, String email) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
    }
}
