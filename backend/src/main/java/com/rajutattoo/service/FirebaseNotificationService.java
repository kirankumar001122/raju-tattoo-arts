package com.rajutattoo.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.rajutattoo.entity.Booking;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

@Service
public class FirebaseNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseNotificationService.class);

    @Value("${firebase.project.id:${FIREBASE_PROJECT_ID:}}")
    private String projectId;

    @Value("${firebase.client.email:${FIREBASE_CLIENT_EMAIL:}}")
    private String clientEmail;

    @Value("${firebase.private.key:${FIREBASE_PRIVATE_KEY:}}")
    private String privateKey;

    private boolean initialized = false;

    @PostConstruct
    public void initFirebaseAdminSDK() {
        logger.info("==================================================");
        logger.info("FIREBASE CLOUD MESSAGING ADMIN SDK INITIALIZATION");

        if (projectId == null || projectId.isBlank() || clientEmail == null || clientEmail.isBlank() || privateKey == null || privateKey.isBlank()) {
            logger.warn("[DIAGNOSTIC NOTICE] Firebase Admin credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) not set.");
            logger.warn("Push notifications will run in mock diagnostic mode. Configure variables in Render to deliver real FCM browser push notifications.");
            logger.info("==================================================");
            return;
        }

        try {
            if (FirebaseApp.getApps().isEmpty()) {
                String formattedPrivateKey = privateKey.replace("\\n", "\n").trim();
                
                String serviceAccountJson = String.format(
                        "{\n" +
                        "  \"type\": \"service_account\",\n" +
                        "  \"project_id\": \"%s\",\n" +
                        "  \"client_email\": \"%s\",\n" +
                        "  \"private_key\": \"%s\"\n" +
                        "}",
                        escapeJson(projectId.trim()),
                        escapeJson(clientEmail.trim()),
                        escapeJson(formattedPrivateKey)
                );

                ByteArrayInputStream credentialsStream = new ByteArrayInputStream(serviceAccountJson.getBytes(StandardCharsets.UTF_8));
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(credentialsStream))
                        .setProjectId(projectId.trim())
                        .build();

                FirebaseApp.initializeApp(options);
                initialized = true;
                logger.info("Firebase Admin SDK initialized successfully for project: {}", projectId.trim());
            } else {
                initialized = true;
            }
        } catch (Exception e) {
            logger.error("Failed to initialize Firebase Admin SDK: Exception Type: {}, Message: {}", e.getClass().getName(), e.getMessage());
        }
        logger.info("==================================================");
    }

    /**
     * Send FCM browser push notification to customer when booking status updates.
     * Fail-safe execution: notification failures will never fail database operations or crash API.
     */
    public void sendBookingStatusPushNotification(Booking booking, String newStatus) {
        if (booking == null) return;

        String fcmToken = booking.getFcmToken();
        if ((fcmToken == null || fcmToken.isBlank()) && booking.getUser() != null) {
            fcmToken = booking.getUser().getFcmToken();
        }

        String customerName = booking.getCustomerName() != null ? booking.getCustomerName() : "Customer";
        String statusUpper = newStatus != null ? newStatus.toUpperCase().trim() : "UPDATED";
        String service = booking.getService() != null ? booking.getService() : "Tattoo Session";
        String date = booking.getAppointmentDate() != null ? booking.getAppointmentDate().toString() : "";
        String time = booking.getAppointmentTime() != null ? booking.getAppointmentTime().toString() : "";

        String title = "Raju Tattoo Arts";
        String body;

        switch (statusUpper) {
            case "CONFIRMED":
                body = String.format("Hello %s, your appointment #%d for %s on %s at %s is CONFIRMED.", customerName, booking.getId(), service, date, time);
                break;
            case "COMPLETED":
                body = String.format("Hello %s, your appointment #%d has been COMPLETED.", customerName, booking.getId());
                break;
            case "CANCELLED":
                body = String.format("Hello %s, your appointment #%d has been CANCELLED.", customerName, booking.getId());
                break;
            case "REJECTED":
                body = String.format("Hello %s, your appointment #%d has been REJECTED.", customerName, booking.getId());
                break;
            case "PENDING":
            default:
                body = String.format("Hello %s, your appointment #%d request has been received and is pending confirmation.", customerName, booking.getId());
                break;
        }

        logger.info("==================================================");
        logger.info("FCM PUSH NOTIFICATION DISPATCH INITIATED");
        logger.info("Booking ID: #{}", booking.getId());
        logger.info("Customer Name: {}", customerName);
        logger.info("New Status: {}", statusUpper);
        logger.info("Notification Title: {}", title);
        logger.info("Notification Body: {}", body);

        if (fcmToken == null || fcmToken.isBlank()) {
            logger.info("No FCM token registered for Booking #{}. Push notification skipped.", booking.getId());
            logger.info("==================================================");
            return;
        }

        if (!initialized) {
            logger.info("[MOCK FCM PUSH DISPATCH] Token: {}... | Title: {} | Body: {}",
                    fcmToken.length() > 15 ? fcmToken.substring(0, 15) : fcmToken, title, body);
            logger.info("==================================================");
            return;
        }

        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message message = Message.builder()
                    .setToken(fcmToken.trim())
                    .setNotification(notification)
                    .putData("click_action", "/my-bookings")
                    .putData("bookingId", String.valueOf(booking.getId()))
                    .putData("status", statusUpper)
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            logger.info("FCM push notification dispatched successfully for Booking #{}. Response Message ID: {}", booking.getId(), response);
        } catch (Exception e) {
            logger.error("Failed to dispatch FCM push notification for Booking #{}: Exception Type: {}, Message: {}",
                    booking.getId(), e.getClass().getName(), e.getMessage());
        }
        logger.info("==================================================");
    }

    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
