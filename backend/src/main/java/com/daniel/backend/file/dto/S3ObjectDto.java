package com.daniel.backend.file.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class S3ObjectDto {
    private String key;
    private Long size;
    private Instant lastModified;
    private String displayName;

}

