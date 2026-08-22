package com.rajutattoo.service;

import com.rajutattoo.dto.AuthRequest;
import com.rajutattoo.dto.AuthResponse;
import com.rajutattoo.dto.RegisterRequest;
import com.rajutattoo.entity.User;
import com.rajutattoo.exception.ResourceNotFoundException;
import com.rajutattoo.repository.UserRepository;
import com.rajutattoo.security.JwtUtils;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Value("${app.admin.email:darshantejomaya@gmail.com}")
    private String adminEmail;

    @Value("${app.admin.password:Darshan@2003}")
    private String adminPassword;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

    @Autowired
    public AuthService(UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        AuthenticationManager authenticationManager,
                        JwtUtils jwtUtils,
                        UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @PostConstruct
    public void initAdminUser() {
        String cleanAdminEmail = adminEmail.trim().toLowerCase();
        User admin = userRepository.findByEmail(cleanAdminEmail).orElseGet(User::new);
        if (admin.getId() == null) {
            admin.setName("Darshan Tejomaya (Studio Admin)");
            admin.setEmail(cleanAdminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setPhone("+91 7676272709");
            admin.setRole("ROLE_ADMIN");
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
        } else if (!"ROLE_ADMIN".equals(admin.getRole())) {
            admin.setRole("ROLE_ADMIN");
            userRepository.save(admin);
        }
    }

    public AuthResponse register(RegisterRequest request) {
        String reqEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(reqEmail)) {
            throw new IllegalArgumentException("Email already registered.");
        }

        // Enforce role = ROLE_USER for all public registrations (ignore client role input)
        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(reqEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone().trim());
        user.setRole("ROLE_USER");
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String token = jwtUtils.generateToken(userDetails);

        return new AuthResponse(token, savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getPhone(), savedUser.getRole());
    }

    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (AuthenticationException ex) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtils.generateToken(userDetails);

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getRole());
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
}
