package com.daniel.backend.service;

import com.daniel.backend.entity.Users;
import com.daniel.backend.repository.UserRepo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepo userRepo;

    // You might want to consider making these configurable
    private static final String GOOGLE_ROLE = "ROLE_GOOGLE_USER";
    private static final String GITHUB_ROLE = "ROLE_GITHUB_USER";
    private static final String LOCAL_ROLE = "ROLE_LOCAL_USER";

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
            default -> username = email; // Fallback to email if username is not directly available
        }

        Optional<Users> userOptional = userRepo.findByEmail(email);

        if (userOptional.isEmpty()) {
            Users newUser = new Users();
            newUser.setEmail(email);
            newUser.setUsername(username);

            // Determine the role based on registrationId without using an enum
            String role;
            switch (registrationId) {
                case "google":
                    role = GOOGLE_ROLE;
                    break;
                case "github":
                    role = GITHUB_ROLE;
                    break;
                default:
                    role = LOCAL_ROLE; // Or a general "ROLE_USER" for unknown providers
                    break;
            }
//            newUser.setRole(role); // Assuming setRole now accepts a String
            newUser.setVerified(true);
            newUser.setPassword(""); // OAuth2 users typically don't have a password
            userRepo.save(newUser);
        }

        System.out.println("OAuth2 user: " + oAuth2User.getAttributes());
        String token = jwtService.generateToken(email);
        // TODO: Fix the oauth system as it doesn't work properly and redirects to the login page even though the user is logged in
        // jwtService.generateToken(email);
        // response.sendRedirect("http://localhost:3000/oauth2-redirect?token=" + token + "&email=" + email);
        //
        // response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        // response.getWriter().write("{\"token\":\"" + token + "\",\"email\":\"" + email + "\"}");
        // response.setStatus(HttpServletResponse.SC_OK);
    }
}