package com.example.demo.service.payment;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.example.demo.dto.PaymentRequest;
import com.example.demo.model.Payment;
import com.example.demo.model.PaymentMethod;
import com.example.demo.model.PaymentStatus;

@Component
public class CardPaymentProcessor implements PaymentProcessor {

    @Override
    public boolean supports(PaymentMethod paymentMethod) {
        return paymentMethod == PaymentMethod.CREDIT_CARD || 
               paymentMethod == PaymentMethod.DEBIT_CARD;
    }

    @Override
    public Payment process(Payment payment, PaymentRequest request) {
        // Validate card details
        if (request.getCardDetails() == null) {
            throw new RuntimeException("Card details are required for card payment");
        }

        // Process card payment (integrate with payment gateway in real implementation)
        boolean paymentSuccessful = processCardPayment(request.getCardDetails(), request.getAmount());
        
        if (paymentSuccessful) {
            payment.setCardLastFour(getLastFourDigits(request.getCardDetails().getCardNumber()));
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setProcessedAt(LocalDateTime.now());
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }
        
        return payment;
    }

    private boolean processCardPayment(com.example.demo.dto.CardDetails cardDetails, java.math.BigDecimal amount) {
        // Mock implementation - integrate with actual payment gateway
        // For demo purposes, always return true
        return true;
    }

    private String getLastFourDigits(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) {
            return "0000";
        }
        return cardNumber.substring(cardNumber.length() - 4);
    }
}