package com.daniel.backend.auth.dto;


import lombok.Data;

@Data
public class VerifyRequest {
    private String email;
    private String verificationCode;
}
