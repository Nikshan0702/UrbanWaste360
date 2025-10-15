package com.example.demo.service;

import java.math.BigDecimal;

import com.example.demo.dto.WalletResponse;
import com.example.demo.model.Wallet;

public interface WalletService {
    WalletResponse getWalletBalance(String userId);
    WalletResponse updateWalletBalance(String userId, BigDecimal amount);
    Wallet createWallet(String userId);
    boolean hasSufficientBalance(String userId, BigDecimal amount);
}