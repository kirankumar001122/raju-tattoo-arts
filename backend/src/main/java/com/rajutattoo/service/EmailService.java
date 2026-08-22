package com.rajutattoo.service;

import com.rajutattoo.entity.Booking;
import com.rajutattoo.entity.Notification;
import com.rajutattoo.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import jakarta.annotation.PostConstruct;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final NotificationRepository notificationRepository;

    @Value("${spring.mail.username:rajutattoadda@gmail.com}")
    private String fromEmail;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Autowired
    public EmailService(@Autowired(required = false) JavaMailSender mailSender, NotificationRepository notificationRepository) {
        this.mailSender = mailSender;
        this.notificationRepository = notificationRepository;
    }

    @PostConstruct
    public void init() {
        logger.info("==================================================");
        logger.info("SPRING MAIL CONFIGURATION VERIFICATION");
        logger.info("MAIL_USERNAME = {}", (fromEmail != null && !fromEmail.trim().isEmpty()) ? "detected (" + fromEmail + ")" : "NOT DETECTED");
        logger.info("MAIL_PASSWORD = {}", (mailPassword != null && !mailPassword.trim().isEmpty()) ? "detected" : "NOT DETECTED (EMPTY)");
        logger.info("==================================================");
    }

    public void sendBookingCreatedEmail(Booking booking) {
        if (booking == null || booking.getEmail() == null) return;

        String subject = "Raju Tattoo Arts - Appointment Request Received";
        String body = String.format(
                "Hello %s,\n\n" +
                "Your tattoo appointment request has been received (PENDING).\n\n" +
                "Booking ID: #%d\n" +
                "Service: %s\n" +
                "Appointment Date: %s\n" +
                "Appointment Time: %s\n\n" +
                "Our studio team will review your appointment request shortly.\n\n" +
                "Regards,\n" +
                "Raju Tattoo Arts",
                booking.getCustomerName(),
                booking.getId(),
                booking.getService(),
                booking.getAppointmentDate(),
                booking.getAppointmentTime()
        );

        dispatchEmailAndLog(booking, "BOOKING_CREATED", subject, body);
    }

    public void sendBookingStatusUpdateEmail(Booking booking, String oldStatus, String newStatus) {
        if (booking == null || booking.getEmail() == null || oldStatus.equalsIgnoreCase(newStatus)) return;

        String upperStatus = newStatus.toUpperCase();
        String subject;
        String body;

        switch (upperStatus) {
            case "CONFIRMED":
                subject = "Appointment Confirmed - Raju Tattoo Arts";
                body = String.format(
                        "Dear %s,\n\n" +
                        "Your appointment with Raju Tattoo Arts has been confirmed.\n\n" +
                        "Service: %s\n" +
                        "Appointment Date: %s\n" +
                        "Appointment Time: %s\n" +
                        "Status: CONFIRMED\n\n" +
                        "Thank you for choosing Raju Tattoo Arts.\n\n" +
                        "Contact:\n" +
                        "darshantejomaya@gmail.com\n" +
                        "+91 76762 72709\n" +
                        "Malur, Karnataka, India",
                        booking.getCustomerName(),
                        booking.getService(),
                        booking.getAppointmentDate(),
                        booking.getAppointmentTime()
                );
                dispatchEmailAndLog(booking, "BOOKING_CONFIRMED", subject, body);
                break;

            case "CANCELLED":
                subject = "Appointment Cancelled - Raju Tattoo Arts";
                body = String.format(
                        "Dear %s,\n\n" +
                        "Your appointment with Raju Tattoo Arts has been cancelled.\n\n" +
                        "Service: %s\n" +
                        "Appointment Date: %s\n" +
                        "Appointment Time: %s\n" +
                        "Status: CANCELLED\n\n" +
                        "If you have questions, please contact the studio.\n\n" +
                        "Contact:\n" +
                        "darshantejomaya@gmail.com\n" +
                        "+91 76762 72709\n" +
                        "Malur, Karnataka, India",
                        booking.getCustomerName(),
                        booking.getService(),
                        booking.getAppointmentDate(),
                        booking.getAppointmentTime()
                );
                dispatchEmailAndLog(booking, "BOOKING_CANCELLED", subject, body);
                break;

            case "COMPLETED":
                subject = "Appointment Completed - Raju Tattoo Arts";
                body = String.format(
                        "Dear %s,\n\n" +
                        "Your appointment with Raju Tattoo Arts has been marked as completed.\n\n" +
                        "Service: %s\n" +
                        "Appointment Date: %s\n" +
                        "Appointment Time: %s\n" +
                        "Status: COMPLETED\n\n" +
                        "Thank you for choosing Raju Tattoo Arts.\n\n" +
                        "Contact:\n" +
                        "darshantejomaya@gmail.com\n" +
                        "+91 76762 72709",
                        booking.getCustomerName(),
                        booking.getService(),
                        booking.getAppointmentDate(),
                        booking.getAppointmentTime()
                );
                dispatchEmailAndLog(booking, "BOOKING_COMPLETED", subject, body);
                break;

            default:
                subject = "Appointment Status Update - Raju Tattoo Arts";
                body = String.format(
                        "Dear %s,\n\n" +
                        "Your appointment status with Raju Tattoo Arts has been updated to %s.\n\n" +
                        "Service: %s\n" +
                        "Appointment Date: %s\n" +
                        "Appointment Time: %s\n" +
                        "Status: %s\n\n" +
                        "Thank you for choosing Raju Tattoo Arts.\n\n" +
                        "Contact:\n" +
                        "darshantejomaya@gmail.com\n" +
                        "+91 76762 72709\n" +
                        "Malur, Karnataka, India",
                        booking.getCustomerName(),
                        upperStatus,
                        booking.getService(),
                        booking.getAppointmentDate(),
                        booking.getAppointmentTime(),
                        upperStatus
                );
                dispatchEmailAndLog(booking, "BOOKING_STATUS_UPDATE", subject, body);
                break;
        }
    }

    public void sendPaymentSuccessEmail(Booking booking, String razorpayPaymentId, String razorpayOrderId, java.math.BigDecimal amount) {
        if (booking == null || booking.getEmail() == null) return;

        String subject = "Raju Tattoo Arts - Payment Confirmation (PAID)";
        String body = String.format(
                "Hello %s,\n\n" +
                "Your payment for tattoo appointment #%d has been successfully verified (PAID).\n\n" +
                "Booking ID: #%d\n" +
                "Service: %s\n" +
                "Appointment Date: %s\n" +
                "Appointment Time: %s\n" +
                "Amount Paid: ₹%.2f\n" +
                "Razorpay Payment ID: %s\n" +
                "Razorpay Order ID: %s\n" +
                "Payment Status: PAID\n\n" +
                "Thank you for choosing Raju Tattoo Arts. We look forward to your session.\n\n" +
                "Regards,\n" +
                "Raju Tattoo Arts",
                booking.getCustomerName(),
                booking.getId(),
                booking.getId(),
                booking.getService(),
                booking.getAppointmentDate(),
                booking.getAppointmentTime(),
                amount != null ? amount : java.math.BigDecimal.ZERO,
                razorpayPaymentId != null ? razorpayPaymentId : "N/A",
                razorpayOrderId != null ? razorpayOrderId : "N/A"
        );

        dispatchEmailAndLog(booking, "PAYMENT_CONFIRMED", subject, body);
    }

    private void dispatchEmailAndLog(Booking booking, String type, String subject, String body) {
        boolean sentSuccessfully = false;
        String recipient = booking.getEmail();

        logger.info("==================================================");
        logger.info("EMAIL NOTIFICATION DISPATCH INITIATED");
        logger.info("Booking ID: #{}", booking.getId());
        logger.info("Customer Name: {}", booking.getCustomerName());
        logger.info("Recipient Email: {}", recipient);
        logger.info("Notification Type: {}", type);
        logger.info("Sender Email: {}", fromEmail);

        if (mailPassword == null || mailPassword.trim().isEmpty()) {
            logger.warn("[DIAGNOSTIC NOTICE] MAIL_PASSWORD environment variable is empty.");
            logger.warn("To deliver real emails to {}, set MAIL_PASSWORD environment variable with a 16-character Gmail App Password.", recipient);
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(recipient);
            message.setSubject(subject);
            message.setText(body);

            if (mailSender != null) {
                mailSender.send(message);
                sentSuccessfully = true;
                logger.info("Email [{}] dispatched successfully via SMTP to {}", type, recipient);
            } else {
                logger.info("[MOCK EMAIL DISPATCH] [{}] to {}: Subject: {}", type, recipient, subject);
            }
        } catch (Exception e) {
            logger.error("Email dispatch failed for Booking #{}: Exception Type: {}, Exception Message: {}",
                    booking.getId(), e.getClass().getName(), e.getMessage(), e);
        }
        logger.info("==================================================");

        // Save persistent record in MySQL notifications table
        try {
            Notification notification = new Notification();
            notification.setUser(booking.getUser());
            notification.setBookingId(booking.getId());
            notification.setType(type);
            notification.setStatus(sentSuccessfully ? "SENT" : "FAILED");
            notification.setMessage(body);
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        } catch (Exception e) {
            logger.warn("Failed to record notification history: {}", e.getMessage());
        }
    }
}
