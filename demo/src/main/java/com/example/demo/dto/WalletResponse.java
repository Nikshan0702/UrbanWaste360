package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WalletResponse {
    private String userId;
    private BigDecimal balance;
    private String currency;
    private LocalDateTime lastUpdated;

    public WalletResponse() {}

    public WalletResponse(String userId, BigDecimal balance, String currency, LocalDateTime lastUpdated) {
        this.userId = userId;
        this.balance = balance;
        this.currency = currency;
        this.lastUpdated = lastUpdated;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}