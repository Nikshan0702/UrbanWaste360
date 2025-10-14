package com.example.demo.service;

import java.math.BigDecimal;
import java.util.List;

import com.example.demo.dto.PaymentHistoryResponse;
import com.example.demo.dto.PaymentRequest;
import com.example.demo.dto.PaymentResponse;
import com.example.demo.dto.WalletResponse;

public interface PaymentService {
    PaymentResponse processPayment(PaymentRequest request);
    WalletResponse getWalletBalance(String userId);
    WalletResponse addToWallet(String userId, BigDecimal amount);
    List<PaymentHistoryResponse> getPaymentHistory(String userId);
}