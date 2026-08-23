package com.rajutattoo.service;

import com.rajutattoo.entity.Booking;
import com.rajutattoo.entity.Notification;
import com.rajutattoo.repository.NotificationRepository;
import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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

    /**
     * Dispatches HTML email to customer when a booking request is newly created.
     */
    public void sendBookingCreatedEmail(Booking booking) {
        if (booking == null || booking.getEmail() == null || booking.getEmail().isBlank()) {
            logger.warn("Skipping booking created email: Booking or customer email is missing.");
            return;
        }

        String recipientEmail = booking.getEmail().trim();
        String customerName = booking.getCustomerName() != null ? booking.getCustomerName() : "Valued Customer";
        String subject = "Raju Tattoo Arts – Appointment Request Received";

        String statusBadgeHtml = getStatusBadgeHtml("PENDING");
        String messageText = "Thank you for choosing Raju Tattoo Arts.<br><br>We have received your appointment request and it is currently pending confirmation. Our studio team will review your request shortly and notify you when the status changes.";

        String htmlContent = buildHtmlEmailTemplate(
                "Appointment Request Received",
                customerName,
                booking,
                "PENDING",
                statusBadgeHtml,
                messageText,
                null
        );

        logger.info("Sending appointment creation email for booking #{} to customer ({})", booking.getId(), recipientEmail);
        dispatchHtmlEmailAndLog(booking, "BOOKING_CREATED", recipientEmail, subject, htmlContent);
    }

    /**
     * Dispatches HTML email to customer when appointment status changes.
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
                messageText = "Great news! Your appointment has been confirmed. We look forward to seeing you at Raju Tattoo Arts.";
                break;
            case "COMPLETED":
                subject = "Raju Tattoo Arts – Appointment Completed";
                messageText = "Your appointment has been marked as completed. Thank you for choosing Raju Tattoo Arts!";
                break;
            case "CANCELLED":
                subject = "Raju Tattoo Arts – Appointment Cancelled";
                messageText = "Your appointment has been cancelled. If you have any questions or wish to reschedule, please contact Raju Tattoo Arts.";
                break;
            case "REJECTED":
                subject = "Raju Tattoo Arts – Appointment Rejected";
                messageText = "Unfortunately, your appointment request could not be accepted at this time. Please contact us if you would like to discuss alternative availability.";
                break;
            default:
                subject = "Raju Tattoo Arts – Appointment Status Updated (" + upperStatus + ")";
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

        logger.info("Appointment #{} status changed from {} to {}", booking.getId(), oldStatus, upperStatus);
        dispatchHtmlEmailAndLog(booking, "BOOKING_STATUS_" + upperStatus, recipientEmail, subject, htmlContent);
    }

    /**
     * Dispatches HTML payment verification receipt email.
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

        logger.info("Sending payment confirmation email for booking #{} to customer ({})", booking.getId(), recipientEmail);
        dispatchHtmlEmailAndLog(booking, "PAYMENT_CONFIRMED", recipientEmail, subject, htmlContent);
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
                "                  <td style=\"padding: 10px 14px; color: #A1A1AA; font-size: 13px; font-weight: 600; border-bottom: 1px solid #27272A; width: 40%;\">Booking ID</td>" +
                "                  <td style=\"padding: 10px 14px; color: #FFFFFF; font-size: 13px; font-weight: 700; border-bottom: 1px solid #27272A;\">#" + booking.getId() + "</td>" +
                "                </tr>" +
                "                <tr>" +
                "                  <td style=\"padding: 10px 14px; color: #A1A1AA; font-size: 13px; font-weight: 600; border-bottom: 1px solid #27272A;\">Service</td>" +
                "                  <td style=\"padding: 10px 14px; color: #FFFFFF; font-size: 13px; font-weight: 600; border-bottom: 1px solid #27272A;\">" + escapeHtml(serviceName) + "</td>" +
                "                </tr>" +
                "                <tr>" +
                "                  <td style=\"padding: 10px 14px; color: #A1A1AA; font-size: 13px; font-weight: 600; border-bottom: 1px solid #27272A;\">Date</td>" +
                "                  <td style=\"padding: 10px 14px; color: #FFFFFF; font-size: 13px; border-bottom: 1px solid #27272A;\">" + formattedDate + "</td>" +
                "                </tr>" +
                "                <tr>" +
                "                  <td style=\"padding: 10px 14px; color: #A1A1AA; font-size: 13px; font-weight: 600; border-bottom: 1px solid #27272A;\">Time</td>" +
                "                  <td style=\"padding: 10px 14px; color: #FFFFFF; font-size: 13px; border-bottom: 1px solid #27272A;\">" + formattedTime + "</td>" +
                "                </tr>" +
                previousStatusRow +
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
     * Generates styled HTML status badges matching theme colors.
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
     * Dispatch HTML email via Spring JavaMailSender.
     * Guaranteed fail-safe: logs diagnostic results and records notification without interrupting appointment database flow.
     */
    private void dispatchHtmlEmailAndLog(Booking booking, String type, String recipient, String subject, String htmlContent) {
        boolean sentSuccessfully = false;

        logger.info("==================================================");
        logger.info("EMAIL NOTIFICATION DISPATCH INITIATED");
        logger.info("Booking ID: #{}", booking.getId());
        logger.info("Customer Name: {}", booking.getCustomerName());
        logger.info("Recipient Email: {}", recipient);
        logger.info("Notification Type: {}", type);
        logger.info("Sender Email: {}", fromEmail);

        if (mailPassword == null || mailPassword.trim().isEmpty()) {
            logger.warn("[DIAGNOSTIC NOTICE] MAIL_PASSWORD environment variable is empty.");
            logger.warn("To deliver real emails to {}, set MAIL_PASSWORD environment variable in Render with a 16-character Gmail App Password.", recipient);
        }

        try {
            if (mailSender != null) {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

                try {
                    helper.setFrom(fromEmail, "Raju Tattoo Arts");
                } catch (Exception ex) {
                    helper.setFrom(fromEmail);
                }

                helper.setTo(recipient);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);

                mailSender.send(mimeMessage);
                sentSuccessfully = true;
                logger.info("Appointment confirmation email sent successfully to customer ({}) for booking #{}", recipient, booking.getId());
            } else {
                logger.info("[MOCK EMAIL DISPATCH] [{}] to {}: Subject: {}", type, recipient, subject);
            }
        } catch (Exception e) {
            logger.error("Failed to send appointment email for booking #{}: Exception Type: {}, Message: {}",
                    booking.getId(), e.getClass().getName(), e.getMessage());
        }
        logger.info("==================================================");

        // Save persistent record in MySQL notifications table
        try {
            Notification notification = new Notification();
            notification.setUser(booking.getUser());
            notification.setBookingId(booking.getId());
            notification.setType(type);
            notification.setStatus(sentSuccessfully ? "SENT" : "FAILED");
            notification.setMessage("Subject: " + subject);
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        } catch (Exception e) {
            logger.warn("Failed to record notification history in database: {}", e.getMessage());
        }
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
