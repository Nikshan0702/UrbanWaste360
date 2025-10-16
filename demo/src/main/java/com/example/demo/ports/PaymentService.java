package com.example.demo.ports;

import java.util.List;

import com.example.demo.model.Payment;

public interface PaymentService {
    // existing
    void settle(String userId, double amount, String method, String cardToken);
    double getOutstanding(String userId);

    // add these (used by controllers / UI)
    double getWalletBalance(String userId);
    List<Payment> getHistory(String userId);

    // admin adds a charge
    void addCharge(String userId, double amount, String reason);
}