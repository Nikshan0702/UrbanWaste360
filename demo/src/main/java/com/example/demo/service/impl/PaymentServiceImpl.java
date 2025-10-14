package com.example.demo.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.PaymentRequest;
import com.example.demo.dto.PaymentResponse;
import com.example.demo.dto.WalletResponse;
import com.example.demo.model.Payment;
import com.example.demo.model.PaymentMethod;
import com.example.demo.model.PaymentStatus;
import com.example.demo.repository.PaymentRepository;
import com.example.demo.service.PaymentService;
import com.example.demo.service.WalletService;
import com.example.demo.service.payment.PaymentProcessor;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final WalletService walletService;
    private final List<PaymentProcessor> paymentProcessors;

    public PaymentServiceImpl(PaymentRepository paymentRepository, 
                            WalletService walletService, 
                            List<PaymentProcessor> paymentProcessors) {
        this.paymentRepository = paymentRepository;
        this.walletService = walletService;
        this.paymentProcessors = paymentProcessors;
    }

    @Override
    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        try {
            PaymentMethod paymentMethod = PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
            
            // Create payment record
            Payment payment = createPaymentRecord(request, paymentMethod);
            
            // Process payment using appropriate processor
            Payment processedPayment = getPaymentProcessor(paymentMethod)
                    .process(payment, request);
            
            // Save the processed payment
            Payment savedPayment = paymentRepository.save(processedPayment);
            
            return buildPaymentResponse(savedPayment);
            
        } catch (Exception e) {
            log.error("Payment processing failed for user {}: {}", request.getUserId(), e.getMessage());
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
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Amount must be positive");
        }
        return walletService.updateWalletBalance(userId, amount);
    }

    private Payment createPaymentRecord(PaymentRequest request, PaymentMethod paymentMethod) {
        Payment payment = new Payment();
        payment.setUserId(request.getUserId());
        payment.setPaymentMethod(paymentMethod);
        payment.setAmount(request.getAmount());
        payment.setOrderId(request.getOrderId());
        payment.setDescription(request.getDescription());
        payment.setTransactionId(generateTransactionId());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setCurrency("USD");
        payment.setCreatedAt(LocalDateTime.now());
        return paymentRepository.save(payment);
    }

    private PaymentProcessor getPaymentProcessor(PaymentMethod paymentMethod) {
        return paymentProcessors.stream()
                .filter(processor -> processor.supports(paymentMethod))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Unsupported payment method: " + paymentMethod));
    }

    private PaymentResponse buildPaymentResponse(Payment payment) {
        return new PaymentResponse(
            payment.getId(),
            payment.getStatus().name(),
            getStatusMessage(payment.getStatus()),
            payment.getTransactionId(),
            payment.getAmount(),
            payment.getWalletBalanceAfter(),
            payment.getProcessedAt()
        );
    }

    private String getStatusMessage(PaymentStatus status) {
        switch (status) {
            case COMPLETED: return "Payment completed successfully";
            case FAILED: return "Payment failed";
            case PROCESSING: return "Payment is being processed";
            default: return "Payment is pending";
        }
    }

    private String generateTransactionId() {
        return "TXN_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }
}