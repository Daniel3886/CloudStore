package com.daniel.backend.auth.controller;

import com.daniel.backend.auth.dto.*;
import com.daniel.backend.auth.service.AuthenticationService;
import com.daniel.backend.auth.service.DomainValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/auth")
public class UserController {

    @Autowired
    private AuthenticationService authService;

    @Autowired
    private DomainValidationService dnsValidationService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(
                authService.register(
                        request.getUsername(),
                        request.getEmail(),
                        request.getPassword()
                )
        );
    }

    @PostMapping("/resend-code")
    public ResponseEntity<String> resendCode(@RequestBody ResendCodeRequest request) {
        return ResponseEntity.ok(
                authService.resendVerificationCode(request.getEmail())
        );
    }

    @GetMapping("/validate")
    public boolean validateEmail(@RequestParam String email) {
        return dnsValidationService.isDomainValid(email);
    }

    @PostMapping("/verify-token")
    public ResponseEntity<String> verify(@RequestBody VerifyRequest request) {
        String token = authService.verify(request);
        return ResponseEntity.ok("Verification successful. Token: " + token);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest request) {
        TokenResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.requestPasswordReset(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @PostMapping("/verify-password")
    public ResponseEntity<String> verifyPasswordReset(@RequestBody VerifyRequest request) {
        return ResponseEntity.ok(authService.verifyPasswordResetCode(request));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<TokenResponse> refreshToken(@RequestBody TokenRefreshRequest request) {
        String newAccessToken = authService.refreshAccessToken(request.getRefreshToken());
        String email = authService.extractEmailFromRefreshToken(request.getRefreshToken());
        String newRefreshToken = authService.generateRefreshToken(email);
        return ResponseEntity.ok(new TokenResponse(newAccessToken, newRefreshToken));
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<String> deleteAccount(@RequestBody DeleteAccountRequest request) {
        return ResponseEntity.ok(authService.deleteAccount(request));
    }

}
