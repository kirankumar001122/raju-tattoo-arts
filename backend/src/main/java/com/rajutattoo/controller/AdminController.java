package com.rajutattoo.controller;

import com.rajutattoo.dto.ClientDTO;
import com.rajutattoo.entity.Booking;
import com.rajutattoo.entity.User;
import com.rajutattoo.repository.BookingRepository;
import com.rajutattoo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @Autowired
    public AdminController(UserRepository userRepository, BookingRepository bookingRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    // GET /api/admin/clients -> 200 OK (Returns all registered clients with booking metrics)
    @GetMapping("/clients")
    public ResponseEntity<List<ClientDTO>> getRegisteredClients() {
        List<User> users = userRepository.findByRoleNotContainingIgnoreCase("ADMIN");
        List<ClientDTO> clients = new ArrayList<>();

        for (User user : users) {
            List<Booking> userBookings = bookingRepository.findByEmailIgnoreCaseOrUserEmailIgnoreCaseOrderByCreatedAtDesc(user.getEmail(), user.getEmail());
            LocalDate lastBookingDate = userBookings.isEmpty() ? null : userBookings.get(0).getAppointmentDate();

            clients.add(new ClientDTO(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getPhone(),
                    userBookings.size(),
                    lastBookingDate,
                    user.getCreatedAt()
            ));
        }

        return ResponseEntity.ok(clients);
    }
}
