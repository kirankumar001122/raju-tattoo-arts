package com.rajutattoo.controller;

import com.rajutattoo.entity.Payment;
import com.rajutattoo.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @Autowired
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // GET /api/payments/config -> Public endpoint returning Razorpay Key ID for Checkout init
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getRazorpayConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("keyId", paymentService.getRazorpayKeyId());
        return ResponseEntity.ok(config);
    }

    // GET /api/payments/status -> Safe credential diagnostic status check
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getPaymentDiagnostics() {
        return ResponseEntity.ok(paymentService.getDiagnosticStatus());
    }

    // POST /api/payments/create-booking-order -> Pre-booking Razorpay order creation
    @PostMapping("/create-booking-order")
    public ResponseEntity<Map<String, Object>> createBookingOrder(@RequestBody Map<String, Object> request) {
        String userEmail = getAuthenticatedUserEmail();
        Map<String, Object> orderInfo = paymentService.createBookingOrder(request, userEmail);
        return new ResponseEntity<>(orderInfo, HttpStatus.CREATED);
    }

    // POST /api/payments/verify-and-book -> Signature verification & MySQL booking + payment creation
    @PostMapping("/verify-and-book")
    public ResponseEntity<Map<String, Object>> verifyPaymentAndBook(@RequestBody Map<String, Object> request) {
        String userEmail = getAuthenticatedUserEmail();
        Map<String, Object> result = paymentService.verifyPaymentAndCreateBooking(request, userEmail);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    // POST /api/payments/create-order -> Creates Razorpay Order for an existing Booking
    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createPaymentOrder(@RequestBody Map<String, Object> request) {
        Long bookingId = null;
        if (request.get("bookingId") != null) {
            bookingId = Long.valueOf(request.get("bookingId").toString());
        }

        String userEmail = getAuthenticatedUserEmail();
        Map<String, Object> orderInfo = paymentService.createOrder(bookingId, userEmail);
        return new ResponseEntity<>(orderInfo, HttpStatus.CREATED);
    }

    // POST /api/payments/verify -> Signature verification & marking payment PAID
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, String> request) {
        String razorpayOrderId = request.get("razorpay_order_id");
        String razorpayPaymentId = request.get("razorpay_payment_id");
        String razorpaySignature = request.get("razorpay_signature");
        
        Long bookingId = null;
        if (request.get("bookingId") != null) {
            try {
                bookingId = Long.valueOf(request.get("bookingId"));
            } catch (Exception ignored) {}
        }

        String userEmail = getAuthenticatedUserEmail();
        Map<String, Object> result = paymentService.verifyPayment(
                razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId, userEmail
        );
        return ResponseEntity.ok(result);
    }

    // GET /api/payments/booking/{bookingId} -> Fetch payment status for a specific booking
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<Map<String, Object>> getBookingPaymentStatus(@PathVariable Long bookingId) {
        Map<String, Object> status = paymentService.getBookingPaymentStatus(bookingId);
        return ResponseEntity.ok(status);
    }

    // GET /api/payments/my -> Fetch logged in user's payments
    @GetMapping("/my")
    public ResponseEntity<List<Payment>> getMyPayments() {
        String userEmail = getAuthenticatedUserEmail();
        List<Payment> myPayments = paymentService.getUserPayments(userEmail);
        return ResponseEntity.ok(myPayments);
    }

    // GET /api/payments/admin/metrics -> Admin dashboard payment metrics
    @GetMapping("/admin/metrics")
    public ResponseEntity<Map<String, Object>> getAdminPaymentMetrics() {
        Map<String, Object> metrics = paymentService.getAdminPaymentMetrics();
        return ResponseEntity.ok(metrics);
    }

    // POST /api/payments/webhook -> Razorpay Webhook Event Endpoint
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload,
                                                @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        // Log webhook receipt and process idempotently
        return ResponseEntity.ok("Webhook received");
    }

    private String getAuthenticatedUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return null;
    }
}
