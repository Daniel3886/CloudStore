package com.daniel.backend.service;

import com.daniel.backend.entity.Role;
import com.daniel.backend.entity.Users;
import com.daniel.backend.repository.UserRepo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepo userRepo;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String registrationId = ((OAuth2AuthenticationToken) authentication).getAuthorizedClientRegistrationId();

        String username;
        switch (registrationId) {
            case "github" -> username = oAuth2User.getAttribute("login");
            case "google" -> username = oAuth2User.getAttribute("name");
            default -> username = email;
        }

        var userOptional = userRepo.findByEmail(email);

        if (userOptional.isEmpty()) {
            Users newUser = new Users();
            newUser.setEmail(email);
            newUser.setUsername(username);
            newUser.setRole(
                    switch (registrationId) {
                        case "google" -> Role.GOOGLE;
                        case "github" -> Role.GITHUB;
                        default -> Role.LOCAL;
                    }
            );
            newUser.setVerified(true);
            newUser.setPassword(""); // OAuth2 users typically don't have a password
            userRepo.save(newUser);
        }

        String jwtToken = jwtService.generateToken(email);
    }

}
