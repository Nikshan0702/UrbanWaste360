package com.example.demo.service;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import com.example.demo.dto.PaymentRequest;
import com.example.demo.dto.WalletResponse;
import com.example.demo.model.PaymentMethod;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.data.mongodb.uri=mongodb://localhost:27017/test-db"
})
public class PaymentFlowTest {

    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private WasteSellingService wasteSellingService;

    @Test
    public void testWasteSellingAndPaymentFlow() {
        String userId = "test-user-123";
        
        // Step 1: Sell waste and add money to wallet
        BigDecimal wasteAmount = new BigDecimal("100.00");
        WalletResponse walletAfterSelling = wasteSellingService.sellWaste(userId, wasteAmount, "Plastic");
        
        assertNotNull(walletAfterSelling);
        assertEquals(wasteAmount, walletAfterSelling.getBalance());
        
        // Step 2: Check wallet balance
        WalletResponse walletBalance = paymentService.getWalletBalance(userId);
        assertEquals(wasteAmount, walletBalance.getBalance());
        
        // Step 3: Make a payment using wallet
        BigDecimal paymentAmount = new BigDecimal("50.00");
        PaymentRequest paymentRequest = new PaymentRequest(userId, paymentAmount, PaymentMethod.WALLET);
        
        var paymentResponse = paymentService.processPayment(paymentRequest);
        
        assertNotNull(paymentResponse);
        assertEquals(PaymentMethod.WALLET, paymentResponse.getPaymentMethod());
        assertEquals(paymentAmount, paymentResponse.getAmount());
        
        // Step 4: Verify wallet balance after payment
        WalletResponse walletAfterPayment = paymentService.getWalletBalance(userId);
        BigDecimal expectedBalance = wasteAmount.subtract(paymentAmount);
        assertEquals(expectedBalance, walletAfterPayment.getBalance());
        
        // Step 5: Test card payment
        PaymentRequest cardPaymentRequest = new PaymentRequest(userId, new BigDecimal("25.00"), PaymentMethod.CARD);
        var cardPaymentResponse = paymentService.processPayment(cardPaymentRequest);
        
        assertNotNull(cardPaymentResponse);
        assertEquals(PaymentMethod.CARD, cardPaymentResponse.getPaymentMethod());
        
        // Wallet balance should remain the same after card payment
        WalletResponse walletAfterCardPayment = paymentService.getWalletBalance(userId);
        assertEquals(expectedBalance, walletAfterCardPayment.getBalance());
    }
}
