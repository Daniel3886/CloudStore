package com.daniel.backend.service;

import com.daniel.backend.dto.LoginRequest;
import com.daniel.backend.dto.VerifyRequest;
import com.daniel.backend.entity.Role;
import com.daniel.backend.entity.Users;
import com.daniel.backend.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;



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
        if (repo.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        if (repo.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already in use");
        }

        String encodedPassword = passwordEncoder.encode(rawPassword);
        String code = String.format("%06d", (int)(Math.random() * 1_000_000));

        Users newUser = new Users();
        newUser.setUsername(username);
        newUser.setEmail(email);
        newUser.setPassword(encodedPassword);
        newUser.setVerificationCode(code);
        newUser.setVerified(false);
        newUser.setRole(Role.LOCAL);

        repo.save(newUser);

        emailService.sendVerificationEmail(email, code);
        return "User registered successfully. Verification code: " + code;
    }

    public String verify(VerifyRequest request) {
        String email = request.getEmail();
        String code = request.getVerificationCode();

        if (email == null || code == null) {
            throw new RuntimeException("Email and verification code are required.");
        }

        Users user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User with this email not found."));

        if (user.isVerified()) {
            throw new RuntimeException("User is already verified.");
        }

        if (!code.equals(user.getVerificationCode())) {
            throw new RuntimeException("Invalid verification code.");
        }

        user.setVerified(true);
        user.setVerificationCode(null);
        repo.save(user);

        return jwtService.generateToken(user.getUsername());
    }

    public String login(LoginRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();

        if (email == null || password == null) {
            throw new RuntimeException("Email and password are required.");
        }

        Users user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found."));

        if (!user.isVerified()) {
            throw new RuntimeException("Please verify your account before logging in.");
        }

        if (user.getRole() != Role.LOCAL) {
            throw new RuntimeException("This account uses " + user.getRole().name() + " login. Please use that platform.");
        }

        if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password.");
        }

        return jwtService.generateToken(user.getUsername());
    }
}
