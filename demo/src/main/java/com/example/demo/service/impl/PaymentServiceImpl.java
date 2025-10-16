// src/main/java/com/example/demo/service/impl/PaymentServiceImpl.java
package com.example.demo.service.impl;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.example.demo.ports.PaymentService;
import com.example.demo.ports.WalletService;

@Service // single @Service bean
public class PaymentServiceImpl implements PaymentService {

    private final WalletService wallet;
    private final Map<String, Double> outstanding = new ConcurrentHashMap<>();

    public PaymentServiceImpl(WalletService wallet) {
        this.wallet = wallet;
    }

    @Override
    public void settle(String userId, double amount, String method, String cardToken) {
        double due = getOutstanding(userId);
        double pay = Math.min(amount, due);
        if (pay <= 0) return;

        if ("WALLET".equals(method)) {
            wallet.debit(userId, pay, "Outstanding settlement");
        } else { /* CARD: call PSP here (assume success) */ }

        outstanding.put(userId, Math.max(0.0, due - pay));
    }

    @Override
    public double getOutstanding(String userId) {
        return outstanding.getOrDefault(userId, 0.0);
    }

    @Override
    public void addCharge(String userId, double amount, String reason) {
        outstanding.merge(userId, amount, Double::sum);
    }
}