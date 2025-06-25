package com.daniel.backend.auth.controller;

import com.daniel.backend.auth.entity.Users;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ExampleController {

    private List<Users> users = List.of(
            new Users(1, "user1", "password1", "example@gmail.com"),
            new Users(2, "user2", "password2", "example2@gmail.com")
    );

    @GetMapping("/")
    public String greet (HttpServletRequest request) {
        return "Welcome to the User API: " + request.getRemoteAddr() + "!";
    }

    @GetMapping("/users")
    public List<Users> getUsers() {
        return users;
    }


    @PostMapping("/users")
    public Users addUsers(@RequestBody Users user) {
        users.add(user);
        return user;
    }


}
