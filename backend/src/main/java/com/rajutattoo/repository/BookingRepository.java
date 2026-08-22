package com.rajutattoo.repository;

import com.rajutattoo.entity.Booking;
import com.rajutattoo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserOrderByCreatedAtDesc(User user);
    List<Booking> findByUserEmailOrderByCreatedAtDesc(String email);
    List<Booking> findByEmailIgnoreCaseOrUserEmailIgnoreCaseOrderByCreatedAtDesc(String email, String userEmail);
    List<Booking> findAllByOrderByCreatedAtDesc();
}
