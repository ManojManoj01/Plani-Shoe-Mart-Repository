package com.stepstyle.service.impl;

import com.stepstyle.entity.PaymentStatus;
import com.stepstyle.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class MockPaymentServiceImpl implements PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(MockPaymentServiceImpl.class);

    @Override
    public PaymentResult processPayment(String paymentMethod, BigDecimal amount, String orderNumber) {
        logger.info("[PAYMENT GATEWAY STUB] Processing {} payment of {} for order {}", paymentMethod, amount, orderNumber);

        if ("COD".equalsIgnoreCase(paymentMethod)) {
            // Cash on delivery: payment collected upon delivery
            return PaymentResult.success(
                    "COD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                    PaymentStatus.PENDING,
                    "Cash on Delivery selected. Payment will be collected upon delivery.",
                    amount
            );
        }

        if ("ONLINE".equalsIgnoreCase(paymentMethod) || "CARD".equalsIgnoreCase(paymentMethod) || "UPI".equalsIgnoreCase(paymentMethod)) {
            // Stubbed gateway simulation for credit card or UPI
            // Generates a mock transaction reference
            String transactionId = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            logger.info("[PAYMENT GATEWAY STUB] Payment confirmed. Transaction ID: {}", transactionId);
            return PaymentResult.success(
                    transactionId,
                    PaymentStatus.PAID,
                    "Payment simulated successfully via mock gateway adapter.",
                    amount
            );
        }

        // Unknown payment method
        logger.warn("[PAYMENT GATEWAY STUB] Unsupported payment method: {}", paymentMethod);
        return PaymentResult.failure("Unsupported payment method: " + paymentMethod, amount);
    }

    @Override
    public PaymentResult refundPayment(String transactionId, BigDecimal amount) {
        logger.info("[PAYMENT GATEWAY STUB] Simulating refund for transaction {}: Amount {}", transactionId, amount);
        return PaymentResult.success(
                "REF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                PaymentStatus.REFUNDED,
                "Refund simulated successfully.",
                amount
        );
    }
}
