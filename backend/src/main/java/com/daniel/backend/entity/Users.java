package com.daniel.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Collections;
import java.util.Set;

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

    @Column(name = "created_at")
    private java.time.LocalDateTime verificationCodeCreatedAt;

    public Users() {}

    public Users(int id, String username, String password, String email) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
    }
}
