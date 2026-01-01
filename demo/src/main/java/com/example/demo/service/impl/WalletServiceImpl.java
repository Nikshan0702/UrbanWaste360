package com.example.demo.service.impl;

import java.math.BigDecimal;
import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.WalletResponse;
import com.example.demo.model.Wallet;
import com.example.demo.repository.WalletRepository;
import com.example.demo.service.WalletService;

@Service
public class WalletServiceImpl implements WalletService {

    private static final String DEFAULT_CURRENCY = "LKR";

    private final WalletRepository walletRepository;

    public WalletServiceImpl(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    @Override
    public WalletResponse getWalletBalance(String userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> createWallet(userId));

        return new WalletResponse(
            wallet.getUserId(),
            wallet.getBalance(),
            DEFAULT_CURRENCY,            // <- your Wallet doesn't store currency; return a default
            wallet.getUpdatedAt()
        );
    }

    @Override
    @Transactional
    public WalletResponse updateWalletBalance(String userId, BigDecimal amount) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> createWallet(userId));

        BigDecimal newBalance = wallet.getBalance().add(amount == null ? BigDecimal.ZERO : amount);
        wallet.setBalance(newBalance);
        wallet.setUpdatedAt(Instant.now());   // <- use Instant to match your model

        Wallet saved = walletRepository.save(wallet);

        return new WalletResponse(
            saved.getUserId(),
            saved.getBalance(),
            DEFAULT_CURRENCY,            // <- default again
            saved.getUpdatedAt()
        );
    }

    @Override
    public Wallet createWallet(String userId) {
        // Your Wallet has no (String, BigDecimal) ctor — set properties explicitly
        Wallet w = new Wallet();
        w.setUserId(userId);
        w.setBalance(BigDecimal.ZERO);
        w.setUpdatedAt(Instant.now());
        return walletRepository.save(w);
    }

    @Override
    public boolean hasSufficientBalance(String userId, BigDecimal amount) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> createWallet(userId));
        if (amount == null) return false;
        return wallet.getBalance().compareTo(amount) >= 0;
    }
}