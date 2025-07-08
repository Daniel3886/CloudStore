package com.daniel.backend.file.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "files")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Files {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String s3Key;
    private String displayName;
    private Long ownerId;        // TODO: useful for file ownership (file sharing, etc.)
    private boolean isFolder;    // future: folder support?
}
