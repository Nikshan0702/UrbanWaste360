// src/main/java/com/example/demo/controller/WalletQueryController.java
package com.example.demo.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.ports.WalletService;

@RestController
@RequestMapping("/api/payments")
public class WalletQueryController {

    private final WalletService walletService;

    public WalletQueryController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/wallet/{userId}")
    public Map<String, Object> getWallet(@PathVariable String userId) {
        return Map.of("balance", walletService.getBalance(userId));
    }
}