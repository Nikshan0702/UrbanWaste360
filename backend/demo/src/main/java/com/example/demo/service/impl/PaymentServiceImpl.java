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
import com.example.demo.service.payment.PaymentProcessorFactory;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final WalletService walletService;
    private final PaymentProcessorFactory paymentProcessorFactory;

    public PaymentServiceImpl(PaymentRepository paymentRepository, 
                            WalletService walletService,
                            PaymentProcessorFactory paymentProcessorFactory) {
        this.paymentRepository = paymentRepository;
        this.walletService = walletService;
        this.paymentProcessorFactory = paymentProcessorFactory;
    }

    @Override
    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        try {
            // Create payment
            Payment payment = new Payment(request.getUserId(), request.getAmount(), request.getPaymentMethod());

            // Process payment using appropriate processor
            Payment processedPayment = paymentProcessorFactory.processPayment(payment, request);
            
            // Save the processed payment
            Payment savedPayment = paymentRepository.save(processedPayment);

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
    public List<PaymentHistoryResponse> getPaymentHistory(String userId) {
        List<Payment> payments = paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        return payments.stream().map(payment -> {
            String type = "expense";
            String description = payment.getPaymentMethod() + " Payment";
            
            // If it's a wallet top-up (positive amount), change the type and description
            if (payment.getAmount().compareTo(BigDecimal.ZERO) > 0 && 
                payment.getPaymentMethod() == PaymentMethod.WALLET) {
                type = "income";
                description = "Waste Selling Income";
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