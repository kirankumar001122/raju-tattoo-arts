package com.rajutattoo.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ClientDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private long totalBookings;
    private LocalDate lastBookingDate;
    private LocalDateTime registeredDate;

    public ClientDTO() {
    }

    public ClientDTO(Long id, String name, String email, String phone, long totalBookings, LocalDate lastBookingDate, LocalDateTime registeredDate) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.totalBookings = totalBookings;
        this.lastBookingDate = lastBookingDate;
        this.registeredDate = registeredDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public LocalDate getLastBookingDate() {
        return lastBookingDate;
    }

    public void setLastBookingDate(LocalDate lastBookingDate) {
        this.lastBookingDate = lastBookingDate;
    }

    public LocalDateTime getRegisteredDate() {
        return registeredDate;
    }

    public void setRegisteredDate(LocalDateTime registeredDate) {
        this.registeredDate = registeredDate;
    }
}
