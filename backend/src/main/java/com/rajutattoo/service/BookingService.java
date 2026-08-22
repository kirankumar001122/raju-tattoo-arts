package com.rajutattoo.service;

import com.rajutattoo.entity.Booking;
import com.rajutattoo.entity.User;
import com.rajutattoo.exception.ResourceNotFoundException;
import com.rajutattoo.repository.BookingRepository;
import com.rajutattoo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BookingService {

    private static final List<String> ALLOWED_STATUSES = Arrays.asList("PENDING", "CONFIRMED", "COMPLETED", "CANCELLED");

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SmsNotificationService smsNotificationService;

    @Autowired
    public BookingService(BookingRepository bookingRepository,
                           UserRepository userRepository,
                           EmailService emailService,
                           SmsNotificationService smsNotificationService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.smsNotificationService = smsNotificationService;
    }

    public Booking createBooking(Booking booking) {
        booking.setStatus("PENDING");
        booking.setCreatedAt(LocalDateTime.now());

        // Securely resolve authenticated user if logged in
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

                // ONLY link User entity if the user is a normal client/customer (NOT AN ADMIN)
                if (authUser != null && authUser.getRole() != null && !authUser.getRole().toUpperCase().contains("ADMIN")) {
                    booking.setUser(authUser);
                    if (booking.getCustomerName() == null || booking.getCustomerName().isBlank()) {
                        booking.setCustomerName(authUser.getName());
                    }
                    if (booking.getEmail() == null || booking.getEmail().isBlank()) {
                        booking.setEmail(authUser.getEmail());
                    }
                    if (booking.getPhone() == null || booking.getPhone().isBlank()) {
                        booking.setPhone(authUser.getPhone());
                    }
                } else {
                    // Admin is creating/managing a booking - do NOT link Admin user entity
                    booking.setUser(null);
                }
            }
        }

        // Link with client account by email if present and non-admin
        if (booking.getUser() == null && booking.getEmail() != null && !booking.getEmail().isBlank()) {
            String reqEmail = booking.getEmail().trim().toLowerCase();
            userRepository.findByEmail(reqEmail).ifPresent(clientUser -> {
                if (clientUser.getRole() != null && !clientUser.getRole().toUpperCase().contains("ADMIN")) {
                    booking.setUser(clientUser);
                }
            });
        }

        Booking savedBooking = bookingRepository.save(booking);

        // Trigger email & SMS notifications safely
        emailService.sendBookingCreatedEmail(savedBooking);
        smsNotificationService.sendBookingSmsNotification(
                savedBooking,
                "CREATED",
                "Hello " + savedBooking.getCustomerName() + ", your appointment #" + savedBooking.getId() + " request has been received (PENDING)."
        );

        return savedBooking;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Booking> getUserBookings(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) return List.of();
        String cleanEmail = userEmail.trim().toLowerCase();
        return bookingRepository.findByEmailIgnoreCaseOrUserEmailIgnoreCaseOrderByCreatedAtDesc(cleanEmail, cleanEmail);
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    public Map<String, Object> trackBooking(Long bookingId, String email) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found. Please check your Booking ID."));

        if (email == null || !booking.getEmail().equalsIgnoreCase(email.trim())) {
            throw new ResourceNotFoundException("Unable to find a booking with the provided details.");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("bookingId", booking.getId());
        response.put("service", booking.getService());
        response.put("appointmentDate", booking.getAppointmentDate());
        response.put("appointmentTime", booking.getAppointmentTime());
        response.put("status", booking.getStatus());
        response.put("createdAt", booking.getCreatedAt());

        return response;
    }

    public Booking updateBookingStatus(Long id, String newStatus) {
        if (newStatus == null || !ALLOWED_STATUSES.contains(newStatus.toUpperCase())) {
            throw new IllegalArgumentException("Invalid status: " + newStatus + ". Allowed statuses are: PENDING, CONFIRMED, COMPLETED, CANCELLED");
        }

        Booking booking = getBookingById(id);
        String oldStatus = booking.getStatus();
        String upperNewStatus = newStatus.toUpperCase();

        // 1. Duplicate status protection: If oldStatus equals newStatus, do not update database and do not send email
        if (oldStatus != null && oldStatus.equalsIgnoreCase(upperNewStatus)) {
            org.slf4j.LoggerFactory.getLogger(BookingService.class).info("Status for bookingId={} is already {}. No update or email sent.", id, upperNewStatus);
            return booking;
        }

        // 2. Update status in MySQL database
        booking.setStatus(upperNewStatus);
        booking.setStatusUpdatedAt(LocalDateTime.now());
        Booking updatedBooking = bookingRepository.save(booking);

        org.slf4j.LoggerFactory.getLogger(BookingService.class).info("Appointment status updated successfully: bookingId={}, status={}", updatedBooking.getId(), upperNewStatus);

        // 3. Only after successful database update, send email notification safely (without rolling back status if email fails)
        try {
            emailService.sendBookingStatusUpdateEmail(updatedBooking, oldStatus, upperNewStatus);
            smsNotificationService.sendBookingSmsNotification(
                    updatedBooking,
                    upperNewStatus,
                    "Hello " + updatedBooking.getCustomerName() + ", your appointment #" + updatedBooking.getId() + " status is now " + upperNewStatus + "."
            );
        } catch (Exception ex) {
            org.slf4j.LoggerFactory.getLogger(BookingService.class).error("Email notification failed for bookingId={}: {}", updatedBooking.getId(), ex.getMessage());
        }

        return updatedBooking;
    }

    public Booking saveDirectly(Booking booking) {
        return bookingRepository.save(booking);
    }
}
