package com.rajutattoo.service;

import com.rajutattoo.entity.Booking;
import com.rajutattoo.entity.Notification;
import com.rajutattoo.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SmsNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(SmsNotificationService.class);
    private final NotificationRepository notificationRepository;

    @Autowired
    public SmsNotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void sendBookingSmsNotification(Booking booking, String notificationType, String messageContent) {
        if (booking == null) return;
        String phone = booking.getPhone() != null ? booking.getPhone() : "N/A";

        logger.info("[SMS NOTIFICATION - OPTIONAL INTEGRATION] Type: {}, Phone: {}, Message: {}", notificationType, phone, messageContent);

        // Record SMS notification status in MySQL notifications table (Optional integration)
        try {
            Notification notification = new Notification();
            notification.setUser(booking.getUser());
            notification.setBookingId(booking.getId());
            notification.setType("SMS_" + notificationType);
            notification.setStatus("OPTIONAL_UNCONFIGURED");
            notification.setMessage("SMS (Optional) to " + phone + ": " + messageContent);
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        } catch (Exception e) {
            logger.warn("Failed to record SMS notification in database: {}", e.getMessage());
        }
    }
}
