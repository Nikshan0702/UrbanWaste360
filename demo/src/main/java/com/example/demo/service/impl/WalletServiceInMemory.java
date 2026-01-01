
package com.example.demo.service.impl;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import com.example.demo.ports.WalletService;

@Service
// @Primary // ensure this is picked if another WalletService appears later
public class WalletServiceInMemory implements WalletService {

    private final Map<String, Double> balances = new ConcurrentHashMap<>();

    @Override
    public void credit(String userId, double amount, String reason) {
        if (amount <= 0) return;
        balances.merge(userId, amount, Double::sum);
    }

    @Override
    public void debit(String userId, double amount, String reason) {
        if (amount <= 0) return;
        double current = getBalance(userId);
        if (current < amount) {
            throw new IllegalStateException("Insufficient wallet balance");
        }
        balances.put(userId, current - amount);
    }

    @Override
    public double getBalance(String userId) {
        return balances.getOrDefault(userId, 0.0);
    }
}