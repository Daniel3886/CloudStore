package com.daniel.backend.auth.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class TokenResponse {
    private String accessToken;
    private String refreshToken;

    public TokenResponse(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}
