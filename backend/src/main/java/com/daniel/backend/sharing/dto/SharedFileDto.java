package com.daniel.backend.sharing.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SharedFileDto {
    private Long fileId;
    private String displayName;
    private String sharedByEmail;
    private String s3Key;
}
