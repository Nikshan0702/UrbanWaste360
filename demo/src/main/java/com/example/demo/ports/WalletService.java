// src/main/java/com/example/demo/ports/WalletService.java
package com.example.demo.ports;
public interface WalletService {
    void credit(String userId, double amount, String reason);
    void debit(String userId, double amount, String reason);
    double getBalance(String userId);
}