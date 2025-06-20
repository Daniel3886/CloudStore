package com.daniel.backend.service;

import com.daniel.backend.dto.LoginRequest;
import com.daniel.backend.dto.VerifyRequest;
import com.daniel.backend.entity.Users;
import com.daniel.backend.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthenticationService {

    @Autowired
    private UserRepo repo;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public String register(String username, String email, String rawPassword) {
        String encodedPassword = passwordEncoder.encode(rawPassword);
        String code = generateVerificationCode();

        if (repo.findByUsername(username).isPresent() && !(repo.findByUsername(username).isEmpty())) {
            throw new RuntimeException("Username already in use");
        }

        Optional<Users> existingUser = repo.findByEmail(email);
        Users user = existingUser.orElseGet(Users::new);

        if (existingUser.isPresent()) {
            if (user.isVerified()) throw new RuntimeException("Email already in use.");
            validateEmailRateLimit(user);
        }

        if (!existingUser.isPresent()) {
            populateUserForRegistration(user, username, email, encodedPassword, code);
        } else {
            user.setVerificationCode(code);
            user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(1));
            user.setLastVerificationEmailSentAt(LocalDateTime.now());
        }
        repo.save(user);
        emailService.sendVerificationEmail(email, code);

        return existingUser.isPresent()
                ? "Verification code re-sent to your email."
                : "User registered successfully. Verification code sent to email.";
    }

    public String verify(VerifyRequest request) {
        try {
            validateVerifyRequest(request);
        } catch (RuntimeException e) {
            throw new RuntimeException("Invalid verification request: " + e.getMessage());
        }

        Users user = repo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User with this email not found."));

        if (user.isVerified()) throw new RuntimeException("User is already verified.");
        if (user.getVerificationCodeExpiresAt() == null ||
                LocalDateTime.now().isAfter(user.getVerificationCodeExpiresAt())) {
            throw new RuntimeException("Verification code has expired.");
        }
        if (!request.getVerificationCode().equals(user.getVerificationCode())) {
            throw new RuntimeException("Invalid verification code.");
        }

        user.setVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiresAt(null);
        repo.save(user);

        return jwtService.generateToken(user.getUsername());
    }

    public String login(LoginRequest request) {
        try {
            validateLoginRequest(request);
        } catch (RuntimeException e) {
            throw new RuntimeException("Invalid login request: " + e.getMessage());
        }

        Users user = repo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email not found."));

        if (!user.isVerified()) throw new RuntimeException("Please verify your account before logging in.");
        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password.");
        }

        return jwtService.generateToken(user.getUsername());
    }
    private void validateEmailRateLimit(Users user) {
        LocalDateTime lastSent = user.getLastVerificationEmailSentAt();
        if (lastSent != null) {
            LocalDateTime nextAllowed = lastSent.plusSeconds(50);
            if (LocalDateTime.now().isBefore(nextAllowed)) {
                long secondsLeft = Duration.between(LocalDateTime.now(), nextAllowed).getSeconds();
                throw new RuntimeException("Please wait " + secondsLeft + " seconds before requesting a new code.");
            }
        }
    }

    private void validateVerifyRequest(VerifyRequest request) {
        if (request.getEmail() == null || request.getVerificationCode() == null) {
            throw new RuntimeException("Email and verification code are required.");
        }
    }

    private void validateLoginRequest(LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new RuntimeException("Email and password are required.");
        }
    }

    private void populateUserForRegistration(Users user, String username, String email, String encodedPassword, String code) {
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(encodedPassword);
        user.setVerified(false);
        user.setVerificationCode(code);
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(1));
        user.setLastVerificationEmailSentAt(LocalDateTime.now());
    }

    private String generateVerificationCode() {
        return String.format("%06d", (int) (Math.random() * 1_000_000));
    }
}
