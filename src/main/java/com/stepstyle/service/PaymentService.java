package com.stepstyle.service;

import com.stepstyle.entity.PaymentStatus;
import java.math.BigDecimal;

public interface PaymentService {

    PaymentResult processPayment(String paymentMethod, BigDecimal amount, String orderNumber);

    PaymentResult refundPayment(String transactionId, BigDecimal amount);

    class PaymentResult {
        private final boolean success;
        private final String transactionId;
        private final PaymentStatus status;
        private final String message;
        private final BigDecimal amount;

        public PaymentResult(boolean success, String transactionId, PaymentStatus status, String message, BigDecimal amount) {
            this.success = success;
            this.transactionId = transactionId;
            this.status = status;
            this.message = message;
            this.amount = amount;
        }

        public static PaymentResult success(String transactionId, PaymentStatus status, String message, BigDecimal amount) {
            return new PaymentResult(true, transactionId, status, message, amount);
        }

        public static PaymentResult failure(String message, BigDecimal amount) {
            return new PaymentResult(false, null, PaymentStatus.FAILED, message, amount);
        }

        public boolean isSuccess() {
            return success;
        }

        public String getTransactionId() {
            return transactionId;
        }

        public PaymentStatus getStatus() {
            return status;
        }

        public String getMessage() {
            return message;
        }

        public BigDecimal getAmount() {
            return amount;
        }
    }
}
