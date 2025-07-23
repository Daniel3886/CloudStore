package com.daniel.backend.file.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class S3ObjectDto {
    private String key;
    private Long size;
    private Instant lastModified;
    private String displayName;

}

