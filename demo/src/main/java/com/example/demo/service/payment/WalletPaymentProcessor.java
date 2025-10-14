package com.example.demo.service.payment;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.example.demo.dto.PaymentRequest;
import com.example.demo.model.Payment;
import com.example.demo.model.PaymentMethod;
import com.example.demo.model.PaymentStatus;
import com.example.demo.service.WalletService;

@Component
public class WalletPaymentProcessor implements PaymentProcessor {

    private final WalletService walletService;

    public WalletPaymentProcessor(WalletService walletService) {
        this.walletService = walletService;
    }

    @Override
    public boolean supports(PaymentMethod paymentMethod) {
        return paymentMethod == PaymentMethod.WALLET;
    }

    @Override
    public Payment process(Payment payment, PaymentRequest request) {
        // Check sufficient balance
        if (!walletService.hasSufficientBalance(request.getUserId(), request.getAmount())) {
            payment.setStatus(PaymentStatus.FAILED);
            return payment;
        }

        // Update wallet balance (deduct amount)
        var walletResponse = walletService.updateWalletBalance(
            request.getUserId(), 
            request.getAmount().negate()
        );

        // Update payment details
        payment.setWalletBalanceAfter(walletResponse.getBalance());
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setProcessedAt(LocalDateTime.now());
        
        return payment;
    }
}