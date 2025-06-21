package com.daniel.backend.controller;

import com.daniel.backend.dto.*;
import com.daniel.backend.repository.UserRepo;
import com.daniel.backend.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/auth")
public class UserController {

    @Autowired
    private AuthenticationService userService;

    @Autowired
    private UserRepo repo;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(
                userService.register(
                request.getUsername(), request.getEmail(), request.getPassword()));
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verify(@RequestBody VerifyRequest request) {
        String token = userService.verify(request);
        System.out.println("Testing verifyRequest: " + request.testingTheDto()); // Debugging line to check the DTO content
        return ResponseEntity.ok("Verification successful. Token: " + token);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(userService.requestPasswordReset(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(userService.resetPassword(request));
    }

    @PostMapping("/verify-password")
    public ResponseEntity<String> verifyPasswordReset(@RequestBody VerifyRequest request) {
        return ResponseEntity.ok(userService.verifyPasswordResetCode(request));
    }

}
