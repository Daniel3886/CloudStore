package com.daniel.backend.auth.dto;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String email;
    private String password;
}
