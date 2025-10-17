package com.example.demo.service.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.example.demo.dto.PaymentRequest;
import com.example.demo.dto.WalletResponse;
import com.example.demo.model.Payment;
import com.example.demo.model.PaymentMethod;
import com.example.demo.model.PaymentStatus;
import com.example.demo.service.WalletService;

class WalletPaymentProcessorTest {

    @Test
    @DisplayName("supports() returns true only for WALLET")
    void supports_only_wallet() {
        WalletPaymentProcessor p = new WalletPaymentProcessor(mock(WalletService.class));
        assertThat(p.supports(PaymentMethod.WALLET)).isTrue();
        assertThat(p.supports(PaymentMethod.CARD)).isFalse();
    }

    @Test
    @DisplayName("process(): insufficient balance -> FAILED")
    void process_insufficient_balance() {
        WalletService walletService = mock(WalletService.class);
        WalletPaymentProcessor p = new WalletPaymentProcessor(walletService);

        PaymentRequest req = new PaymentRequest();
        req.setUserId("U1");
        req.setAmount(new BigDecimal("250.00"));

        when(walletService.hasSufficientBalance("U1", new BigDecimal("250.00")))
                .thenReturn(false);

        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.PENDING);

        Payment out = p.process(payment, req);

        assertThat(out.getStatus()).isEqualTo(PaymentStatus.FAILED);
        verify(walletService, never()).updateWalletBalance(any(), any());
    }

    @Test
    @DisplayName("process(): happy path -> COMPLETED")
    void process_happy_path() {
        WalletService walletService = mock(WalletService.class);
        WalletPaymentProcessor p = new WalletPaymentProcessor(walletService);

        PaymentRequest req = new PaymentRequest();
        req.setUserId("U1");
        req.setAmount(new BigDecimal("100.00"));

        when(walletService.hasSufficientBalance("U1", new BigDecimal("100.00")))
                .thenReturn(true);

        WalletResponse resp = new WalletResponse();
        resp.setBalance(new BigDecimal("900.00"));

        when(walletService.updateWalletBalance(eq("U1"), any(BigDecimal.class)))
                .thenReturn(resp);

        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.PENDING);

        Payment out = p.process(payment, req);

        verify(walletService).updateWalletBalance(eq("U1"), eq(new BigDecimal("-100.00")));
        assertThat(out.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(out.getProcessedAt()).isNotNull().isBeforeOrEqualTo(LocalDateTime.now());
        assertThat(out.getWalletBalanceAfter()).isEqualByComparingTo("900.00");
    }
}
