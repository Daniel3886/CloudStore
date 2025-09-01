package com.daniel.backend.auth.dto;

import lombok.Data;

@Data
public class ResendCodeRequest {
    private String email;
}
