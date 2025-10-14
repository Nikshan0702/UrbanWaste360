package com.example.demo.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.example.demo.dto.WalletResponse;
import com.example.demo.model.Wallet;
import com.example.demo.repository.WalletRepository;
import com.example.demo.service.WalletService;

@Service
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;

    public WalletServiceImpl(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    @Override
    public WalletResponse getWalletBalance(String userId) {
        Wallet wallet = getOrCreateWallet(userId);
        return buildWalletResponse(wallet);
    }

    @Override
    public WalletResponse updateWalletBalance(String userId, BigDecimal amount) {
        Wallet wallet = getOrCreateWallet(userId);
        wallet.setBalance(wallet.getBalance().add(amount));
        wallet.setUpdatedAt(LocalDateTime.now());
        Wallet updatedWallet = walletRepository.save(wallet);
        return buildWalletResponse(updatedWallet);
    }

    @Override
    public Wallet createWallet(String userId) {
        Wallet wallet = new Wallet();
        wallet.setUserId(userId);
        wallet.setBalance(BigDecimal.ZERO);
        wallet.setCurrency("USD");
        wallet.setCreatedAt(LocalDateTime.now());
        wallet.setUpdatedAt(LocalDateTime.now());
        return walletRepository.save(wallet);
    }

    @Override
    public boolean hasSufficientBalance(String userId, BigDecimal amount) {
        Wallet wallet = getOrCreateWallet(userId);
        return wallet.getBalance().compareTo(amount) >= 0;
    }

    private Wallet getOrCreateWallet(String userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> createWallet(userId));
    }

    private WalletResponse buildWalletResponse(Wallet wallet) {
        return new WalletResponse(
            wallet.getUserId(),
            wallet.getBalance(),
            wallet.getCurrency(),
            wallet.getUpdatedAt()
        );
    }
}