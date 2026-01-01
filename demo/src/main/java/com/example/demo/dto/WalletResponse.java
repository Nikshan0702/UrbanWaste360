// src/main/java/com/example/demo/dto/WalletResponse.java
package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class WalletResponse {
    private String userId;
    private BigDecimal balance;
    private String currency;
    private Instant updatedAt;

    // No-args constructor (needed by Jackson)
    public WalletResponse() {}

    // All-args constructor – this is what WalletServiceImpl expects
    public WalletResponse(String userId, BigDecimal balance, String currency, Instant updatedAt) {
        this.userId = userId;
        this.balance = balance;
        this.currency = currency;
        this.updatedAt = updatedAt;
    }

    // Getters & setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}