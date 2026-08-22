package com.rajutattoo.controller;

import com.rajutattoo.entity.Booking;
import com.rajutattoo.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    @Autowired
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // POST /api/bookings -> 201 CREATED
    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody Booking booking) {
        Booking created = bookingService.createBooking(booking);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // GET /api/bookings/my -> 200 OK (User specific bookings fetched via JWT auth context)
    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userEmail = auth.getName();
        List<Booking> userBookings = bookingService.getUserBookings(userEmail);
        return ResponseEntity.ok(userBookings);
    }

    // GET /api/bookings -> 200 OK
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    // GET /api/bookings/track?bookingId={id}&email={email} -> 200 OK or 404 NOT FOUND
    @GetMapping("/track")
    public ResponseEntity<Map<String, Object>> trackBooking(
            @RequestParam Long bookingId,
            @RequestParam String email) {
        Map<String, Object> trackingInfo = bookingService.trackBooking(bookingId, email);
        return ResponseEntity.ok(trackingInfo);
    }

    // GET /api/bookings/{id} -> 200 OK or 404 NOT FOUND
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        Booking booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    // PUT /api/bookings/{id}/status -> 200 OK or 400 BAD REQUEST / 404 NOT FOUND
    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusRequest) {
        
        String newStatus = statusRequest.get("status");
        Booking updated = bookingService.updateBookingStatus(id, newStatus);
        return ResponseEntity.ok(updated);
    }
}
