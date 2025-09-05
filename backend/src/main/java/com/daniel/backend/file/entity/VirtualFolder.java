package com.daniel.backend.file.entity;

import com.daniel.backend.auth.entity.Users;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "virtual_folders")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VirtualFolder {

    @Id
    @GeneratedValue
    private Long folderId;

    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_email", referencedColumnName = "email")
    private Users owner;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "folder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Files> files;

    private String parentPath;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
