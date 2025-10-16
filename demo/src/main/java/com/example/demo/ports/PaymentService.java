// src/main/java/com/example/demo/ports/PaymentService.java
package com.example.demo.ports;
public interface PaymentService {
    void settle(String userId, double amount, String method, String cardToken);
    double getOutstanding(String userId);
    void addCharge(String userId, double amount, String reason); // admin adds charge
}