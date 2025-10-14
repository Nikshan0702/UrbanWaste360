package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {
    private String paymentId;
    private String status;
    private String message;
    private String transactionId;
    private BigDecimal amount;
    private BigDecimal walletBalanceAfter;
    private LocalDateTime processedAt;

    public PaymentResponse() {}

    public PaymentResponse(String paymentId, String status, String message, String transactionId, 
                          BigDecimal amount, BigDecimal walletBalanceAfter, LocalDateTime processedAt) {
        this.paymentId = paymentId;
        this.status = status;
        this.message = message;
        this.transactionId = transactionId;
        this.amount = amount;
        this.walletBalanceAfter = walletBalanceAfter;
        this.processedAt = processedAt;
    }

    // Getters and Setters
    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getWalletBalanceAfter() { return walletBalanceAfter; }
    public void setWalletBalanceAfter(BigDecimal walletBalanceAfter) { this.walletBalanceAfter = walletBalanceAfter; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
}