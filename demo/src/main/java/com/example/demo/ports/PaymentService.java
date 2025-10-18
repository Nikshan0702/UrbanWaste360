package com.example.demo.ports;

import java.util.List;

import com.example.demo.model.Payment;

public interface PaymentService {

    void settle(String userId, double amount, String method, String cardToken);
    double getOutstanding(String userId);


    double getWalletBalance(String userId);
    List<Payment> getHistory(String userId);

 
    void addCharge(String userId, double amount, String reason);
}