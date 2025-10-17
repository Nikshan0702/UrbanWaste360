package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.PaymentHistoryResponse;
import com.example.demo.dto.PaymentRequest;
import com.example.demo.dto.PaymentResponse;
import com.example.demo.dto.WalletResponse;

public interface PaymentService {
    void processPayment(String userId, double amount);
    
    void addOutstanding(String residentId, double amount, String reference);
    PaymentResponse processPayment(PaymentRequest request);
    WalletResponse getWalletBalance(String userId);
    List<PaymentHistoryResponse> getPaymentHistory(String userId);
}