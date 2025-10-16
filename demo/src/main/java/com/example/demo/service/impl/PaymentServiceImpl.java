// src/main/java/com/example/demo/service/impl/PaymentServiceImpl.java
package com.example.demo.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.example.demo.model.Payment;
import com.example.demo.model.PaymentMethod;
import com.example.demo.model.PaymentStatus;
import com.example.demo.ports.PaymentService;
import com.example.demo.ports.WalletService;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final WalletService wallet;

    // simple in-memory demo stores
    private final Map<String, Double> outstanding = new ConcurrentHashMap<>();
    private final Map<String, List<Payment>> history = new ConcurrentHashMap<>();

    public PaymentServiceImpl(WalletService wallet) {
        this.wallet = wallet;
    }

    @Override
    public void settle(String userId, double amount, String method, String cardToken) {
        double due = getOutstanding(userId);
        double pay = Math.min(Math.max(0.0, amount), due);
        if (pay <= 0) return;

        // Parse method safely to enum (default to CARD if unknown)
        PaymentMethod pm;
        try {
            pm = PaymentMethod.valueOf(method == null ? "CARD" : method.toUpperCase());
        } catch (IllegalArgumentException ex) {
            pm = PaymentMethod.CARD;
        }

        if (pm == PaymentMethod.WALLET) {
            // debit wallet balance
            wallet.debit(userId, pay, "Outstanding settlement");
        } else {
            // CARD branch: call PSP here; we assume success in demo
        }

        // Update outstanding
        outstanding.put(userId, Math.max(0.0, due - pay));

        // Record history entry
        addHistory(userId, buildPayment(userId, pm, BigDecimal.valueOf(pay), PaymentStatus.COMPLETED));
    }

    @Override
    public double getOutstanding(String userId) {
        return outstanding.getOrDefault(userId, 0.0);
    }

    @Override
    public void addCharge(String userId, double amount, String reason) {
        if (amount <= 0) return;
        outstanding.merge(userId, amount, Double::sum);

        // Optional: reflect charges as a history line with method WALLET (or CARD).
        // If you prefer not to show charges in history, remove the addHistory call.
        addHistory(userId, buildPayment(userId, PaymentMethod.WALLET, BigDecimal.valueOf(amount), PaymentStatus.COMPLETED));
    }

    @Override
    public double getWalletBalance(String userId) {
        try {
            return wallet.getBalance(userId); // ensure WalletService exposes getBalance(String)
        } catch (Exception e) {
            return 0.0;
        }
    }

    @Override
    public List<Payment> getHistory(String userId) {
        return history.getOrDefault(userId, List.of());
    }

    /* ----------------- helpers ----------------- */

    private void addHistory(String userId, Payment p) {
        history.computeIfAbsent(userId, k -> new ArrayList<>()).add(p);
    }

    private Payment buildPayment(String userId,
                                 PaymentMethod method,
                                 BigDecimal amount,
                                 PaymentStatus status) {
        Payment p = new Payment();
        // Set only the fields that exist on your Payment model:
        p.setId(UUID.randomUUID().toString());
        p.setUserId(userId);
        p.setPaymentMethod(method);          // enum PaymentMethod
        p.setAmount(amount);                 // BigDecimal
        p.setStatus(status);                 // enum PaymentStatus
        p.setCreatedAt(LocalDateTime.now()); // LocalDateTime
        return p;
    }
}