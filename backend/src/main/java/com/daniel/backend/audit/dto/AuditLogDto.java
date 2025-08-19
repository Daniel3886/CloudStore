package com.daniel.backend.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AuditLogDto {
    private String action;
    private String performedBy;
    private String description;
    private LocalDateTime timestamp;
    private String fileDisplayName;
}
