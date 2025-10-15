package com.example.demo.service.payment;

import java.util.List;

import org.springframework.stereotype.Component;

import com.example.demo.dto.PaymentRequest;
import com.example.demo.model.Payment;
import com.example.demo.model.PaymentMethod;

@Component
public class PaymentProcessorFactory {
    
    private final List<PaymentProcessor> paymentProcessors;
    
    public PaymentProcessorFactory(List<PaymentProcessor> paymentProcessors) {
        this.paymentProcessors = paymentProcessors;
    }
    
    public PaymentProcessor getProcessor(PaymentMethod paymentMethod) {
        return paymentProcessors.stream()
                .filter(processor -> processor.supports(paymentMethod))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No processor found for payment method: " + paymentMethod));
    }
    
    public Payment processPayment(Payment payment, PaymentRequest request) {
        PaymentProcessor processor = getProcessor(request.getPaymentMethod());
        return processor.process(payment, request);
    }
}
