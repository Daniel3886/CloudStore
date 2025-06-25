package com.daniel.backend.auth.dto;


import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class RegisterRequest {
    public String username;
    public String email;
    public String password;
}

