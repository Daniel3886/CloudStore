package com.daniel.backend.file.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class S3ObjectDto {
    private Long id;
    private String key;
    private Long size;
    private Instant lastModified;
    private String displayName;
    /** When the file was moved to Trash; null for files that are not in Trash. */
    private Instant deletedAt;
    /** When the nightly cleanup will permanently delete the file; null for files that are not in Trash. */
    private Instant purgeAt;
}

