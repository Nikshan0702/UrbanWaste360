package com.example.demo.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> createWallet(userId));
        
        return new WalletResponse(
            wallet.getUserId(),
            wallet.getBalance(),
            wallet.getCurrency(),
            wallet.getUpdatedAt()
        );
    }

    @Override
    @Transactional
    public WalletResponse updateWalletBalance(String userId, BigDecimal amount) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> createWallet(userId));
        
        BigDecimal newBalance = wallet.getBalance().add(amount);
        wallet.setBalance(newBalance);
        wallet.setUpdatedAt(LocalDateTime.now());
        
        Wallet savedWallet = walletRepository.save(wallet);
        
        return new WalletResponse(
            savedWallet.getUserId(),
            savedWallet.getBalance(),
            savedWallet.getCurrency(),
            savedWallet.getUpdatedAt()
        );
    }

    @Override
    public Wallet createWallet(String userId) {
        Wallet wallet = new Wallet(userId, BigDecimal.ZERO);
        return walletRepository.save(wallet);
    }

    @Override
    public boolean hasSufficientBalance(String userId, BigDecimal amount) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> createWallet(userId));
        
        return wallet.getBalance().compareTo(amount) >= 0;
    }
}