package com.daniel.backend.sharing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SharedFileDto {
    private Long permissionId;
    private Long fileId;
    private String displayName;
    private String sharedBy;
    private String s3Key;
    private String message;
    private LocalDateTime sharedAt;
    private ShareStatus shareStatus;
    private LocalDateTime shareStatusChangedAt;
}
