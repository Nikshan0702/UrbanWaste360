package com.example.demo.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.PaymentHistoryResponse;
import com.example.demo.dto.PaymentRequest;
import com.example.demo.dto.PaymentResponse;
import com.example.demo.dto.WalletResponse;
import com.example.demo.model.Payment;
import com.example.demo.model.PaymentMethod;
import com.example.demo.model.PaymentStatus;
import com.example.demo.repository.PaymentRepository;
import com.example.demo.service.PaymentService;
import com.example.demo.service.WalletService;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final WalletService walletService;

    public PaymentServiceImpl(PaymentRepository paymentRepository, WalletService walletService) {
        this.paymentRepository = paymentRepository;
        this.walletService = walletService;
    }

    @Override
    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        try {
            // Create payment
            Payment payment = new Payment(request.getUserId(), request.getAmount(), request.getPaymentMethod());

            // Handle different payment methods
            if (request.getPaymentMethod() == PaymentMethod.WALLET) {
                if (!walletService.hasSufficientBalance(request.getUserId(), request.getAmount())) {
                    payment.setStatus(PaymentStatus.FAILED);
                    paymentRepository.save(payment);
                    throw new RuntimeException("Insufficient wallet balance");
                }
                
                walletService.updateWalletBalance(request.getUserId(), request.getAmount().negate());
                payment.setStatus(PaymentStatus.COMPLETED);
                
            } else {
                // For CARD and CASH - always successful in demo
                payment.setStatus(PaymentStatus.COMPLETED);
            }

            Payment savedPayment = paymentRepository.save(payment);

            return new PaymentResponse(
                savedPayment.getId(),
                savedPayment.getUserId(),
                savedPayment.getAmount(),
                savedPayment.getPaymentMethod(),
                savedPayment.getStatus(),
                savedPayment.getCreatedAt()
            );

        } catch (Exception e) {
            throw new RuntimeException("Payment processing failed: " + e.getMessage());
        }
    }

    @Override
    public WalletResponse getWalletBalance(String userId) {
        return walletService.getWalletBalance(userId);
    }

    @Override
    @Transactional
    public WalletResponse addToWallet(String userId, BigDecimal amount) {
        // This adds money to wallet (for waste selling income)
        WalletResponse walletResponse = walletService.updateWalletBalance(userId, amount);
        
        // Create a payment record for the wallet top-up
        Payment payment = new Payment(userId, amount, PaymentMethod.WALLET);
        payment.setStatus(PaymentStatus.COMPLETED);
        paymentRepository.save(payment);
        
        return walletResponse;
    }

    @Override
    public List<PaymentHistoryResponse> getPaymentHistory(String userId) {
        List<Payment> payments = paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        return payments.stream().map(payment -> {
            String type = "payment";
            String description = payment.getPaymentMethod() + " Payment";
            
            // If it's a wallet top-up (positive amount), change the type and description
            if (payment.getAmount().compareTo(BigDecimal.ZERO) > 0 && 
                payment.getPaymentMethod() == PaymentMethod.WALLET) {
                type = "income";
                description = "Wallet Top-up";
            }
            
            return new PaymentHistoryResponse(
                payment.getId(),
                type,
                description,
                payment.getAmount(),
                payment.getStatus().toString(),
                payment.getCreatedAt(),
                payment.getId()
            );
        }).collect(Collectors.toList());
    }
}