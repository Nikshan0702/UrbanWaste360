package com.example.demo.service.impl;

import java.math.BigDecimal;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import com.example.demo.ports.WalletService;

/**
 * Adapter service that bridges the ports interface with persistent storage
 * Follows SOLID principles:
 * - Single Responsibility: Only handles wallet operations
 * - Open/Closed: Can be extended without modification
 * - Liskov Substitution: Properly implements both interfaces
 * - Interface Segregation: Implements focused interfaces
 * - Dependency Inversion: Depends on abstractions
 */
@Service
@Primary
public class PersistentWalletService implements WalletService {

    private final com.example.demo.service.WalletService walletService;

    public PersistentWalletService(com.example.demo.service.WalletService walletService) {
        this.walletService = walletService;
    }

    // Implementation for ports.WalletService interface
    @Override
    public void credit(String userId, double amount, String reason) {
        if (amount <= 0) return;
        walletService.updateWalletBalance(userId, BigDecimal.valueOf(amount));
    }

    @Override
    public void debit(String userId, double amount, String reason) {
        if (amount <= 0) return;
        double current = getBalance(userId);
        if (current < amount) {
            throw new IllegalStateException("Insufficient wallet balance");
        }
        walletService.updateWalletBalance(userId, BigDecimal.valueOf(-amount));
    }

    @Override
    public double getBalance(String userId) {
        return walletService.getWalletBalance(userId).getBalance().doubleValue();
    }
}
