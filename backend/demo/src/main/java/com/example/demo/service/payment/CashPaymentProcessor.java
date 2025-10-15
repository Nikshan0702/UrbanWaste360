package com.example.demo.service.payment;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.example.demo.dto.PaymentRequest;
import com.example.demo.model.Payment;
import com.example.demo.model.PaymentMethod;
import com.example.demo.model.PaymentStatus;

@Component
public class CashPaymentProcessor implements PaymentProcessor {

    @Override
    public boolean supports(PaymentMethod paymentMethod) {
        return paymentMethod == PaymentMethod.CASH;
    }

    @Override
    public Payment process(Payment payment, PaymentRequest request) {
        // For cash payments, we assume they are always successful
        // In real application, this might involve generating a receipt or confirmation
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setProcessedAt(LocalDateTime.now());
        
        return payment;
    }
}
