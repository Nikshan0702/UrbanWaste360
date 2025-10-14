package com.example.demo.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class PaymentRequest {
    @NotNull(message = "User ID is required")
    private String userId;
    
    @NotNull(message = "Payment method is required")
    private String paymentMethod;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    private String orderId;
    private String description;
    private CardDetails cardDetails;

    public PaymentRequest() {}

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public CardDetails getCardDetails() { return cardDetails; }
    public void setCardDetails(CardDetails cardDetails) { this.cardDetails = cardDetails; }
}