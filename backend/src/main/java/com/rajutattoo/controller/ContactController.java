package com.rajutattoo.controller;

import com.rajutattoo.entity.ContactEnquiry;
import com.rajutattoo.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    private final ContactService contactService;

    @Autowired
    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    // POST /api/contact -> 201 CREATED
    @PostMapping
    public ResponseEntity<ContactEnquiry> createEnquiry(@Valid @RequestBody ContactEnquiry enquiry) {
        ContactEnquiry created = contactService.createEnquiry(enquiry);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // GET /api/contact/my -> 200 OK (User specific contact enquiries fetched via JWT auth context)
    @GetMapping("/my")
    public ResponseEntity<List<ContactEnquiry>> getMyEnquiries() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userEmail = auth.getName();
        List<ContactEnquiry> userEnquiries = contactService.getUserEnquiries(userEmail);
        return ResponseEntity.ok(userEnquiries);
    }

    // GET /api/contact -> 200 OK (Admin endpoint)
    @GetMapping
    public ResponseEntity<List<ContactEnquiry>> getAllEnquiries() {
        List<ContactEnquiry> enquiries = contactService.getAllEnquiries();
        return ResponseEntity.ok(enquiries);
    }
}
