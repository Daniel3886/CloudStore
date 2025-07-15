package com.daniel.backend.file.entity;

import jakarta.persistence.*;
import com.daniel.backend.auth.entity.Users;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "files")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Files {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "s3_key")
    private String s3Key;

    @Column(name = "display_name")
    private String displayName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_email", referencedColumnName = "email")
    private Users ownerEmail;

//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "owner_id")
//    private Users ownerId;        // TODO: useful for file ownership (file sharing, etc.)

    private LocalDateTime uploadedAt; // TODO: implement this in the service layer
}
