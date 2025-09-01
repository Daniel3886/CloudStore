package com.daniel.backend.auth.dto;

import lombok.Data;

@Data
public class DeleteAccountRequest {
    private String email;       
    private String password;    
}
