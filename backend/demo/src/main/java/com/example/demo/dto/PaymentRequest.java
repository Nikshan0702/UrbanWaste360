package com.example.demo.dto;

import java.math.BigDecimal;
import com.example.demo.model.PaymentMethod;

public class PaymentRequest {
    private String userId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private CardDetails cardDetails; // Add this field

    // Constructors
    public PaymentRequest() {}

    public PaymentRequest(String userId, BigDecimal amount, PaymentMethod paymentMethod) {
        this.userId = userId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
    }

    public PaymentRequest(String userId, BigDecimal amount, PaymentMethod paymentMethod, CardDetails cardDetails) {
        this.userId = userId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.cardDetails = cardDetails;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public CardDetails getCardDetails() { return cardDetails; }
    public void setCardDetails(CardDetails cardDetails) { this.cardDetails = cardDetails; }
}