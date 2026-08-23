package com.rajutattoo.service;

import com.rajutattoo.entity.Booking;
import com.rajutattoo.entity.Notification;
import com.rajutattoo.repository.NotificationRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    private final NotificationRepository notificationRepository;
    private final HttpClient httpClient;

    @Value("${resend.api.key:${RESEND_API_KEY:}}")
    private String resendApiKey;

    @Value("${resend.from.email:${RESEND_FROM_EMAIL:Raju Tattoo Arts <onboarding@resend.dev>}}")
    private String resendFromEmail;

    @Autowired
    public EmailService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @PostConstruct
    public void init() {
        boolean keyDetected = resendApiKey != null && !resendApiKey.trim().isEmpty();
        logger.info("==================================================");
        logger.info("RESEND EMAIL API SERVICE INITIALIZED");
        logger.info("RESEND_API_KEY = {}", keyDetected ? "configured [PROTECTED]" : "NOT CONFIGURATION (MISSING)");
        logger.info("RESEND_FROM_EMAIL = {}", resendFromEmail);
        logger.info("==================================================");
    }

    /**
     * Dispatches HTML email to customer via Resend API when a booking request is newly created.
     */
    public void sendBookingCreatedEmail(Booking booking) {
        if (booking == null || booking.getEmail() == null || booking.getEmail().isBlank()) {
            logger.warn("Skipping booking created email: Booking or customer email is missing.");
            return;
        }

        String recipientEmail = booking.getEmail().trim();
        String customerName = booking.getCustomerName() != null ? booking.getCustomerName() : "Valued Customer";
        String subject = "Raju Tattoo Arts – Appointment Received";

        String statusBadgeHtml = getStatusBadgeHtml("PENDING");
        String messageText = "Thank you for choosing Raju Tattoo Arts.<br><br>We have received your appointment request and it is currently pending confirmation. Our studio team will review your request shortly and notify you when the status changes.";

        String htmlContent = buildHtmlEmailTemplate(
                "Appointment Received",
                customerName,
                booking,
                "PENDING",
                statusBadgeHtml,
                messageText,
                null
        );

        dispatchResendEmailAndLog(booking, "BOOKING_CREATED", recipientEmail, subject, htmlContent);
    }

    /**
     * Dispatches HTML email to customer via Resend API when appointment status changes.
     */
    public void sendBookingStatusUpdateEmail(Booking booking, String oldStatus, String newStatus) {
        if (booking == null || booking.getEmail() == null || booking.getEmail().isBlank()) {
            logger.warn("Skipping status update email: Booking or customer email is missing.");
            return;
        }

        if (oldStatus != null && oldStatus.equalsIgnoreCase(newStatus)) {
            logger.info("Booking #{} status is already {}. No status update email sent.", booking.getId(), newStatus);
            return;
        }

        String recipientEmail = booking.getEmail().trim();
        String customerName = booking.getCustomerName() != null ? booking.getCustomerName() : "Valued Customer";
        String upperStatus = newStatus != null ? newStatus.toUpperCase().trim() : "UPDATED";

        String subject;
        String messageText;

        switch (upperStatus) {
            case "CONFIRMED":
                subject = "Raju Tattoo Arts – Appointment Confirmed";
                messageText = "Great news! Your appointment has been confirmed. We look forward to seeing you at Raju Tattoo Arts studio.";
                break;
            case "COMPLETED":
                subject = "Raju Tattoo Arts – Appointment Completed";
                messageText = "Your appointment has been marked as completed. Thank you for choosing Raju Tattoo Arts! We hope you love your tattoo session.";
                break;
            case "CANCELLED":
                subject = "Raju Tattoo Arts – Appointment Cancelled";
                messageText = "Your appointment has been cancelled. If you have any questions or wish to reschedule, please contact Raju Tattoo Arts.";
                break;
            case "REJECTED":
                subject = "Raju Tattoo Arts – Appointment Update";
                messageText = "Unfortunately, your appointment request could not be accepted at this time. Please contact us if you would like to discuss alternative availability.";
                break;
            default:
                subject = "Raju Tattoo Arts – Appointment Update";
                messageText = "Your appointment status has been updated to " + upperStatus + ". Thank you for choosing Raju Tattoo Arts.";
                break;
        }

        String statusBadgeHtml = getStatusBadgeHtml(upperStatus);

        String htmlContent = buildHtmlEmailTemplate(
                "Appointment Status Updated",
                customerName,
                booking,
                upperStatus,
                statusBadgeHtml,
                messageText,
                oldStatus
        );

        dispatchResendEmailAndLog(booking, "BOOKING_STATUS_" + upperStatus, recipientEmail, subject, htmlContent);
    }

    /**
     * Dispatches HTML payment verification receipt email via Resend API.
     */
    public void sendPaymentSuccessEmail(Booking booking, String razorpayPaymentId, String razorpayOrderId, BigDecimal amount) {
        if (booking == null || booking.getEmail() == null || booking.getEmail().isBlank()) {
            logger.warn("Skipping payment success email: Booking or customer email is missing.");
            return;
        }

        String recipientEmail = booking.getEmail().trim();
        String customerName = booking.getCustomerName() != null ? booking.getCustomerName() : "Valued Customer";
        String subject = "Raju Tattoo Arts – Payment Confirmation (PAID)";

        String statusBadgeHtml = getStatusBadgeHtml("PAID");
        String messageText = String.format(
                "Your payment of &#8377;%.2f for appointment #%d has been successfully verified.<br><br>Razorpay Payment ID: <strong>%s</strong><br>Razorpay Order ID: <strong>%s</strong>",
                amount != null ? amount : BigDecimal.ZERO,
                booking.getId(),
                razorpayPaymentId != null ? razorpayPaymentId : "N/A",
                razorpayOrderId != null ? razorpayOrderId : "N/A"
        );

        String htmlContent = buildHtmlEmailTemplate(
                "Payment Confirmation",
                customerName,
                booking,
                "PAID",
                statusBadgeHtml,
                messageText,
                null
        );

        dispatchResendEmailAndLog(booking, "PAYMENT_CONFIRMED", recipientEmail, subject, htmlContent);
    }

    /**
     * Internal method to construct production-ready HTML Email Template.
     */
    private String buildHtmlEmailTemplate(
            String title,
            String customerName,
            Booking booking,
            String currentStatus,
            String statusBadgeHtml,
            String mainMessage,
            String previousStatus
    ) {
        String formattedDate = booking.getAppointmentDate() != null ? booking.getAppointmentDate().toString() : "N/A";
        String formattedTime = booking.getAppointmentTime() != null ? booking.getAppointmentTime().toString() : "N/A";
        String serviceName = booking.getService() != null ? booking.getService() : "Tattoo Service";

        String previousStatusRow = "";
        if (previousStatus != null && !previousStatus.isBlank()) {
            previousStatusRow = String.format(
                    "<tr>" +
                    "<td style=\"padding: 10px 14px; color: #A1A1AA; font-size: 13px; font-weight: 600; border-bottom: 1px solid #27272A;\">Previous Status</td>" +
                    "<td style=\"padding: 10px 14px; color: #D4D4D8; font-size: 13px; border-bottom: 1px solid #27272A;\">%s</td>" +
                    "</tr>", previousStatus.toUpperCase()
            );
        }

        String tattooRequirementsRow = "";
        if (booking.getRequirements() != null && !booking.getRequirements().isBlank()) {
            tattooRequirementsRow = String.format(
                    "<tr>" +
                    "<td style=\"padding: 10px 14px; color: #A1A1AA; font-size: 13px; font-weight: 600; border-bottom: 1px solid #27272A;\">Tattoo Requirements</td>" +
                    "<td style=\"padding: 10px 14px; color: #FFFFFF; font-size: 13px; border-bottom: 1px solid #27272A;\">%s</td>" +
                    "</tr>", escapeHtml(booking.getRequirements())
            );
        }

        String notesRow = "";
        if (booking.getAdditionalNotes() != null && !booking.getAdditionalNotes().isBlank()) {
            notesRow = String.format(
                    "<tr>" +
                    "<td style=\"padding: 10px 14px; color: #A1A1AA; font-size: 13px; font-weight: 600; border-bottom: 1px solid #27272A;\">Additional Notes</td>" +
                    "<td style=\"padding: 10px 14px; color: #FFFFFF; font-size: 13px; border-bottom: 1px solid #27272A;\">%s</td>" +
                    "</tr>", escapeHtml(booking.getAdditionalNotes())
            );
        }

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset=\"UTF-8\">" +
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "<title>" + title + "</title>" +
                "</head>" +
                "<body style=\"margin:0; padding:0; background-color:#09090B; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#F4F4F5;\">" +
                "  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#09090B; padding: 30px 15px;\">" +
                "    <tr>" +
                "      <td align=\"center\">" +
                "        <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width: 600px; background-color: #18181B; border: 1px solid #D4AF37; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8);\">" +
                "          " +
                "          <!-- HEADER BRANDING -->" +
                "          <tr>" +
                "            <td style=\"background-color: #000000; padding: 26px 20px; text-align: center; border-bottom: 2px solid #D4AF37;\">" +
                "              <h1 style=\"color: #D4AF37; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; font-family: Arial, sans-serif;\">RAJU TATTOO ARTS</h1>" +
                "              <p style=\"color: #A1A1AA; margin: 6px 0 0 0; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600;\">Custom Tattoo &amp; Body Art Studio</p>" +
                "            </td>" +
                "          </tr>" +
                "          " +
                "          <!-- CONTENT BODY -->" +
                "          <tr>" +
                "            <td style=\"padding: 30px 24px;\">" +
                "              <h2 style=\"color: #FFFFFF; font-size: 18px; margin-top: 0; margin-bottom: 16px; font-weight: 700;\">Dear " + escapeHtml(customerName) + ",</h2>" +
                "              " +
                "              <div style=\"background-color: #27272A; border-left: 4px solid #D4AF37; padding: 16px 20px; border-radius: 4px; margin-bottom: 24px; color: #E4E4E7; font-size: 14px; line-height: 1.6;\">" +
                "                " + mainMessage +
                "              </div>" +
                "              " +
                "              <!-- APPOINTMENT DETAILS CARD -->" +
                "              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color: #09090B; border: 1px solid #27272A; border-radius: 6px; margin-bottom: 24px; border-collapse: collapse;\">" +
                "                <tr>" +
                "                  <td colspan=\"2\" style=\"background-color: #27272A; padding: 12px 14px; color: #D4AF37; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;\">" +
                "                    Appointment Details" +
                "                  </td>" +
                "                </tr>" +
                "                <tr>" +
                "                  <td style=\"padding: 10px 14px; color: #A1A1AA; font-size: 13px; font-weight: 600; border-bottom: 1px solid #27272A; width: 40%;\">Customer Name</td>" +
                "                  <td style=\"padding: 10px 14px; color: #FFFFFF; font-size: 13px; font-weight: 700; border-bottom: 1px solid #27272A;\">" + escapeHtml(customerName) + "</td>" +
                "                </tr>" +
                "                <tr>" +
                "                  <td style=\"padding: 10px 14px; color: #A1A1AA; font-size: 13px; font-weight: 600; border-bottom: 1px solid #27272A;\">Booking ID</td>" +
                "                  <td style=\"padding: 10px 14px; color: #FFFFFF; font-size: 13px; font-weight: 700; border-bottom: 1px solid #27272A;\">#" + booking.getId() + "</td>" +
                "                </tr>" +
                "                <tr>" +
                "                  <td style=\"padding: 10px 14px; color: #A1A1AA; font-size: 13px; font-weight: 600; border-bottom: 1px solid #27272A;\">Service</td>" +
                "                  <td style=\"padding: 10px 14px; color: #FFFFFF; font-size: 13px; font-weight: 600; border-bottom: 1px solid #27272A;\">" + escapeHtml(serviceName) + "</td>" +
                "                </tr>" +
                "                <tr>" +
                "                  <td style=\"padding: 10px 14px; color: #A1A1AA; font-size: 13px; font-weight: 600; border-bottom: 1px solid #27272A;\">Appointment Date</td>" +
                "                  <td style=\"padding: 10px 14px; color: #FFFFFF; font-size: 13px; border-bottom: 1px solid #27272A;\">" + formattedDate + "</td>" +
                "                </tr>" +
                "                <tr>" +
                "                  <td style=\"padding: 10px 14px; color: #A1A1AA; font-size: 13px; font-weight: 600; border-bottom: 1px solid #27272A;\">Appointment Time</td>" +
                "                  <td style=\"padding: 10px 14px; color: #FFFFFF; font-size: 13px; border-bottom: 1px solid #27272A;\">" + formattedTime + "</td>" +
                "                </tr>" +
                previousStatusRow +
                tattooRequirementsRow +
                notesRow +
                "                <tr>" +
                "                  <td style=\"padding: 10px 14px; color: #A1A1AA; font-size: 13px; font-weight: 600;\">Current Status</td>" +
                "                  <td style=\"padding: 10px 14px;\">" + statusBadgeHtml + "</td>" +
                "                </tr>" +
                "              </table>" +
                "              " +
                "              <!-- CONTACT & STUDIO INFORMATION -->" +
                "              <div style=\"background-color: #09090B; border: 1px solid #27272A; border-radius: 6px; padding: 16px 20px; color: #A1A1AA; font-size: 12px; line-height: 1.8;\">" +
                "                <strong style=\"color: #D4AF37; font-size: 13px; display: block; margin-bottom: 6px;\">Raju Tattoo Arts Studio Contact &amp; Support</strong>" +
                "                Email: <a href=\"mailto:darshantejomaya@gmail.com\" style=\"color: #D4AF37; text-decoration: none;\">darshantejomaya@gmail.com</a><br>" +
                "                Phone: <span style=\"color: #F4F4F5;\">+91 76762 72709</span><br>" +
                "                Location: <span style=\"color: #F4F4F5;\">Malur, Karnataka, India</span>" +
                "              </div>" +
                "            </td>" +
                "          </tr>" +
                "          " +
                "          <!-- FOOTER -->" +
                "          <tr>" +
                "            <td style=\"background-color: #000000; padding: 18px 20px; text-align: center; border-top: 1px solid #27272A; color: #71717A; font-size: 11px;\">" +
                "              This is an automated notification email sent to <strong>" + escapeHtml(booking.getEmail()) + "</strong>.<br>" +
                "              &copy; " + java.time.Year.now().getValue() + " Raju Tattoo Arts. All rights reserved." +
                "            </td>" +
                "          </tr>" +
                "        </table>" +
                "      </td>" +
                "    </tr>" +
                "  </table>" +
                "</body>" +
                "</html>";
    }

    /**
     * Generates styled HTML status badges matching studio theme colors.
     */
    private String getStatusBadgeHtml(String status) {
        if (status == null) status = "PENDING";
        String upper = status.toUpperCase().trim();

        switch (upper) {
            case "CONFIRMED":
                return "<span style=\"display: inline-block; background-color: #0F1A2E; color: #3B82F6; border: 1px solid #3B82F6; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 12px; letter-spacing: 0.5px;\">CONFIRMED</span>";
            case "COMPLETED":
                return "<span style=\"display: inline-block; background-color: #0A261A; color: #10B981; border: 1px solid #10B981; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 12px; letter-spacing: 0.5px;\">COMPLETED</span>";
            case "CANCELLED":
                return "<span style=\"display: inline-block; background-color: #2B1215; color: #EF4444; border: 1px solid #EF4444; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 12px; letter-spacing: 0.5px;\">CANCELLED</span>";
            case "REJECTED":
                return "<span style=\"display: inline-block; background-color: #2B1215; color: #EF4444; border: 1px solid #EF4444; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 12px; letter-spacing: 0.5px;\">REJECTED</span>";
            case "PAID":
                return "<span style=\"display: inline-block; background-color: #0A261A; color: #10B981; border: 1px solid #10B981; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 12px; letter-spacing: 0.5px;\">PAID</span>";
            case "PENDING":
            default:
                return "<span style=\"display: inline-block; background-color: #261F0D; color: #F59E0B; border: 1px solid #F59E0B; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 12px; letter-spacing: 0.5px;\">PENDING</span>";
        }
    }

    /**
     * Dispatch email via Resend HTTPS REST API.
     * Fail-safe execution: Logs required details and records notification without rolling back DB updates.
     */
    private void dispatchResendEmailAndLog(Booking booking, String type, String recipient, String subject, String htmlContent) {
        boolean sentSuccessfully = false;
        String resendResponseId = null;

        logger.info("==================================================");
        logger.info("Email notification requested");
        logger.info("Booking ID: #{}", booking.getId());
        logger.info("Customer email: {}", recipient);
        logger.info("Notification type: {}", type);
        logger.info("Subject: {}", subject);

        String cleanApiKey = resendApiKey != null ? resendApiKey.trim() : "";
        if (cleanApiKey.isEmpty()) {
            logger.warn("[DIAGNOSTIC NOTICE] RESEND_API_KEY environment variable is empty.");
            logger.warn("To deliver real emails to {}, configure RESEND_API_KEY in Render environment variables.", recipient);
            logger.info("[MOCK RESEND DISPATCH] [{}] to {}: Subject: {}", type, recipient, subject);
        } else {
            try {
                String sender = resendFromEmail != null && !resendFromEmail.isBlank()
                        ? resendFromEmail.trim()
                        : "Raju Tattoo Arts <onboarding@resend.dev>";

                String jsonBody = buildResendJsonPayload(sender, recipient, subject, htmlContent);

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(RESEND_API_URL))
                        .header("Authorization", "Bearer " + cleanApiKey)
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                        .timeout(Duration.ofSeconds(15))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 200 || response.statusCode() == 201) {
                    sentSuccessfully = true;
                    resendResponseId = parseResendId(response.body());
                    logger.info("Resend email sent successfully for booking #{}. Resend response ID: {}", booking.getId(), resendResponseId);
                } else {
                    logger.error("Failed to send appointment email for booking #{}: Resend HTTP status {}, response body: {}",
                            booking.getId(), response.statusCode(), response.body());
                }
            } catch (Exception e) {
                logger.error("Failed to send appointment email for booking #{}: Exception Type: {}, Message: {}",
                        booking.getId(), e.getClass().getName(), e.getMessage());
            }
        }
        logger.info("==================================================");

        // Save persistent record in MySQL notifications table
        try {
            Notification notification = new Notification();
            notification.setUser(booking.getUser());
            notification.setBookingId(booking.getId());
            notification.setType(type);
            notification.setStatus(sentSuccessfully ? "SENT" : "FAILED");
            notification.setMessage("Subject: " + subject + (resendResponseId != null ? " (Resend ID: " + resendResponseId + ")" : ""));
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        } catch (Exception e) {
            logger.warn("Failed to record notification history in database: {}", e.getMessage());
        }
    }

    private String buildResendJsonPayload(String from, String to, String subject, String html) {
        return String.format(
                "{\"from\":%s,\"to\":[%s],\"subject\":%s,\"html\":%s}",
                toJsonString(from),
                toJsonString(to),
                toJsonString(subject),
                toJsonString(html)
        );
    }

    private String toJsonString(String value) {
        if (value == null) return "\"\"";
        StringBuilder sb = new StringBuilder("\"");
        for (char c : value.toCharArray()) {
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < ' ') {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
                    break;
            }
        }
        sb.append("\"");
        return sb.toString();
    }

    private String parseResendId(String responseBody) {
        if (responseBody == null) return null;
        int idIdx = responseBody.indexOf("\"id\"");
        if (idIdx != -1) {
            int colonIdx = responseBody.indexOf(":", idIdx);
            if (colonIdx != -1) {
                int startQuote = responseBody.indexOf("\"", colonIdx);
                if (startQuote != -1) {
                    int endQuote = responseBody.indexOf("\"", startQuote + 1);
                    if (endQuote != -1) {
                        return responseBody.substring(startQuote + 1, endQuote);
                    }
                }
            }
        }
        return null;
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
