package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentHistoryResponse {
    private String id;
    private String type; // "payment" or "income"
    private String description;
    private BigDecimal amount;
    private String status;
    private LocalDateTime date;
    private String transactionId;

    // Constructors
    public PaymentHistoryResponse() {}

    public PaymentHistoryResponse(String id, String type, String description, BigDecimal amount, 
                                 String status, LocalDateTime date, String transactionId) {
        this.id = id;
        this.type = type;
        this.description = description;
        this.amount = amount;
        this.status = status;
        this.date = date;
        this.transactionId = transactionId;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
}