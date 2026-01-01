// src/main/java/com/example/demo/service/impl/WasteSellingServiceImpl.java
package com.example.demo.service.impl;

import java.math.BigDecimal;
import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.WalletResponse;
import com.example.demo.model.Wallet;
import com.example.demo.repository.WalletRepository;
import com.example.demo.service.WasteSellingService;

@Service
@Transactional
public class WasteSellingServiceImpl implements WasteSellingService {

    private final WalletRepository walletRepository;

    public WasteSellingServiceImpl(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    @Override
    public WalletResponse sellWaste(String userId, BigDecimal amount, String wasteType) {
        // Validate input
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
        
        if (wasteType == null || wasteType.trim().isEmpty()) {
            throw new IllegalArgumentException("Waste type is required");
        }

        // Calculate payment based on waste type
        BigDecimal paymentAmount = calculatePayment(amount, wasteType);
        
        // Get or create wallet
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> createNewWallet(userId));
        
        // Update wallet balance
        BigDecimal newBalance = wallet.getBalance().add(paymentAmount);
        wallet.setBalance(newBalance);
        wallet.setUpdatedAt(Instant.now());
        
        // Save updated wallet
        Wallet savedWallet = walletRepository.save(wallet);
        
        System.out.println("💰 Waste sale processed - User: " + userId + 
                          ", Amount: " + amount + " kg of " + wasteType + 
                          ", Payment: LKR " + paymentAmount + 
                          ", New Balance: LKR " + newBalance);
        
        // Return response
        return new WalletResponse(
            savedWallet.getUserId(),
            savedWallet.getBalance(),
            "LKR",
            savedWallet.getUpdatedAt()
        );
    }

    private Wallet createNewWallet(String userId) {
        Wallet wallet = new Wallet();
        wallet.setUserId(userId);
        wallet.setBalance(BigDecimal.ZERO);
        wallet.setUpdatedAt(Instant.now());
        System.out.println("🆕 New wallet created for user: " + userId);
        return wallet;
    }

    private BigDecimal calculatePayment(BigDecimal amount, String wasteType) {
        double pricePerKg = switch (wasteType.toLowerCase()) {
            case "plastic" -> 50.0;
            case "paper" -> 30.0;
            case "metal" -> 80.0;
            case "glass" -> 40.0;
            case "organic" -> 20.0;
            default -> 25.0;
        };
        
        return amount.multiply(BigDecimal.valueOf(pricePerKg));
    }
}