package com.daniel.backend.auth.dto;


import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class VerifyRequest {
    private String email;
    private String verificationCode;

    public String testingTheDto() {
        return "VerifyRequest{" +
                "email='" + email + '\'' +
                ", verificationCode='" + verificationCode + '\'' +
                '}';
    }
}
