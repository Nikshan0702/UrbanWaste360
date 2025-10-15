package com.example.demo.service.payment;

import com.example.demo.dto.PaymentRequest;
import com.example.demo.model.Payment;
import com.example.demo.model.PaymentMethod;

public interface PaymentProcessor {
    boolean supports(PaymentMethod paymentMethod);
    Payment process(Payment payment, PaymentRequest request);
}