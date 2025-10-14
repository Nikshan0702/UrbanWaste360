package com.example.demo.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.WalletResponse;
import com.example.demo.model.Payment;
import com.example.demo.model.PaymentMethod;
import com.example.demo.model.PaymentStatus;
import com.example.demo.repository.PaymentRepository;
import com.example.demo.service.WasteSellingService;
import com.example.demo.service.WalletService;

@Service
public class WasteSellingServiceImpl implements WasteSellingService {

    private final WalletService walletService;
    private final PaymentRepository paymentRepository;

    public WasteSellingServiceImpl(WalletService walletService, PaymentRepository paymentRepository) {
        this.walletService = walletService;
        this.paymentRepository = paymentRepository;
    }

    @Override
    @Transactional
    public WalletResponse sellWaste(String userId, BigDecimal amount, String wasteType) {
        // Add money to wallet from waste selling
        WalletResponse walletResponse = walletService.updateWalletBalance(userId, amount);
        
        // Create a payment record for the waste selling income
        Payment payment = new Payment(userId, amount, PaymentMethod.WALLET);
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setProcessedAt(LocalDateTime.now());
        paymentRepository.save(payment);
        
        return walletResponse;
    }
}
