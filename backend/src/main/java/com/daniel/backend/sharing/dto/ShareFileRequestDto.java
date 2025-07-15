package com.daniel.backend.sharing.dto;

import lombok.Data;

@Data
public class ShareFileRequestDto {
    private Long fileId;
    private String targetUserEmail;
    private PermissionType permissionType;

}
