package com.example.demo.service.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.example.demo.dto.CardDetails;
import com.example.demo.dto.PaymentRequest;
import com.example.demo.model.Payment;
import com.example.demo.model.PaymentMethod;
import com.example.demo.model.PaymentStatus;

@Component
public class CardPaymentProcessor implements PaymentProcessor {

    @Override
    public boolean supports(PaymentMethod paymentMethod) {
        return paymentMethod == PaymentMethod.CARD;
    }

    @Override
    public Payment process(Payment payment, PaymentRequest request) {
        try {
            // For demo purposes, we'll simulate card payment processing
            // In real application, integrate with payment gateway like Stripe, Razorpay, etc.
            
            CardDetails cardDetails = request.getCardDetails();
            
            // Basic validation
            if (cardDetails == null) {
                payment.setStatus(PaymentStatus.FAILED);
                throw new RuntimeException("Card details are required");
            }
            
            // Validate card number (basic check)
            if (!isValidCardNumber(cardDetails.getCardNumber())) {
                payment.setStatus(PaymentStatus.FAILED);
                throw new RuntimeException("Invalid card number");
            }
            
            // Simulate payment processing
            boolean paymentSuccess = simulatePaymentGateway(cardDetails, request.getAmount());
            
            if (paymentSuccess) {
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setProcessedAt(LocalDateTime.now());
            } else {
                payment.setStatus(PaymentStatus.FAILED);
            }
            
            return payment;
            
        } catch (Exception e) {
            payment.setStatus(PaymentStatus.FAILED);
            throw new RuntimeException("Card payment failed: " + e.getMessage());
        }
    }
    
    private boolean isValidCardNumber(String cardNumber) {
        // Basic card number validation (Luhn algorithm would be used in production)
        return cardNumber != null && cardNumber.replace(" ", "").length() >= 13;
    }
    
    private boolean simulatePaymentGateway(CardDetails cardDetails, BigDecimal amount) {
        // Simulate payment gateway response
        // In real application, this would call actual payment gateway API
        try {
            // Simulate processing delay
            Thread.sleep(1000);
            
            // For demo, assume payment is always successful
            // In real app, this would depend on gateway response
            return true;
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
}