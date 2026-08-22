package com.rajutattoo.service;

import com.rajutattoo.entity.ContactEnquiry;
import com.rajutattoo.entity.User;
import com.rajutattoo.exception.ResourceNotFoundException;
import com.rajutattoo.repository.ContactRepository;
import com.rajutattoo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContactService {

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    @Autowired
    public ContactService(ContactRepository contactRepository, UserRepository userRepository) {
        this.contactRepository = contactRepository;
        this.userRepository = userRepository;
    }

    public ContactEnquiry createEnquiry(ContactEnquiry enquiry) {
        enquiry.setCreatedAt(LocalDateTime.now());

        // Securely resolve authenticated user profile if logged in
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String userEmail = null;
            if (auth.getPrincipal() instanceof UserDetails) {
                userEmail = ((UserDetails) auth.getPrincipal()).getUsername();
            } else {
                userEmail = auth.getName();
            }

            if (userEmail != null && !userEmail.isBlank()) {
                String cleanEmail = userEmail.trim().toLowerCase();
                User authUser = userRepository.findByEmail(cleanEmail).orElse(null);

                // ONLY link User entity if non-admin client
                if (authUser != null && authUser.getRole() != null && !authUser.getRole().toUpperCase().contains("ADMIN")) {
                    enquiry.setUser(authUser);
                    if (enquiry.getName() == null || enquiry.getName().isBlank()) {
                        enquiry.setName(authUser.getName());
                    }
                    if (enquiry.getEmail() == null || enquiry.getEmail().isBlank()) {
                        enquiry.setEmail(authUser.getEmail());
                    }
                    if (enquiry.getPhone() == null || enquiry.getPhone().isBlank()) {
                        enquiry.setPhone(authUser.getPhone());
                    }
                } else {
                    enquiry.setUser(null);
                }
            }
        }

        if (enquiry.getUser() == null && enquiry.getEmail() != null && !enquiry.getEmail().isBlank()) {
            String reqEmail = enquiry.getEmail().trim().toLowerCase();
            userRepository.findByEmail(reqEmail).ifPresent(clientUser -> {
                if (clientUser.getRole() != null && !clientUser.getRole().toUpperCase().contains("ADMIN")) {
                    enquiry.setUser(clientUser);
                }
            });
        }

        return contactRepository.save(enquiry);
    }

    public List<ContactEnquiry> getAllEnquiries() {
        return contactRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<ContactEnquiry> getUserEnquiries(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) return List.of();
        String cleanEmail = userEmail.trim().toLowerCase();
        return contactRepository.findByEmailIgnoreCaseOrUserEmailIgnoreCaseOrderByCreatedAtDesc(cleanEmail, cleanEmail);
    }
}
