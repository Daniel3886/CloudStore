package com.daniel.backend.file.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VirtualFolderDto {
    private Long folderId;
    private String name;
    private LocalDateTime createdAt;
    private List<FileDto> files;
}
