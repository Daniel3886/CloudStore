package com.daniel.backend.sharing.entity;

import com.daniel.backend.auth.entity.Users;
import com.daniel.backend.file.entity.Files;
import com.daniel.backend.sharing.dto.PermissionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "file_permission", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"file_id", "shared_with_user_id"})
})
public class FilePermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "file_id")
    private Files file;

    @ManyToOne
    @JoinColumn(name = "shared_with_user_id")
    private Users sharedWith;

    @Enumerated(EnumType.STRING)
    @Column(name = "permission_type")
    private PermissionType permissionType;

    @Column(columnDefinition = "TEXT")
    private String message;

    private LocalDateTime sharedAt;

}
