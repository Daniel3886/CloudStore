package com.daniel.backend.auth.controller;

import com.daniel.backend.auth.dto.*;
import com.daniel.backend.auth.repository.UserRepo;
import com.daniel.backend.auth.service.AuthenticationService;
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

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(
                userService.register(
                request.getUsername(), request.getEmail(), request.getPassword()));
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verify(@RequestBody VerifyRequest request) {
        String token = userService.verify(request);
        return ResponseEntity.ok("Verification successful. Token: " + token);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest request) {
        TokenResponse response = userService.login(request);
        return ResponseEntity.ok(response);
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

    @PostMapping("/refresh-token")
    public ResponseEntity<TokenResponse> refreshToken(@RequestBody TokenRefreshRequest request) {
        String newAccessToken = userService.refreshAccessToken(request.getRefreshToken());
        String email = userService.extractEmailFromRefreshToken(request.getRefreshToken());
        String newRefreshToken = userService.generateRefreshToken(email); // optional
        return ResponseEntity.ok(new TokenResponse(newAccessToken, newRefreshToken));
    }

}
