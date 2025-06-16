package com.daniel.backend.service;

import com.daniel.backend.model.UserModel;
import com.daniel.backend.entity.Users;
import com.daniel.backend.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepo repo;

    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<Users> user = repo.findByEmail(email);
        if (user.isEmpty() || !user.get().isVerified()) {
            throw new UsernameNotFoundException("User not found or not verified");
        }
        return new UserModel(user.get());
    }
}