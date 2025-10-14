package com.example.demo.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import com.example.demo.model.Payment;

@Repository
public class PaymentRepository {
    private final Map<String, Payment> payments = new ConcurrentHashMap<>();

    public Payment save(Payment payment) {
        if (payment.getId() == null) {
            payment.setId(UUID.randomUUID().toString());
        }
        payments.put(payment.getId(), payment);
        return payment;
    }

    public List<Payment> findByUserIdOrderByCreatedAtDesc(String userId) {
        return payments.values().stream()
                .filter(payment -> userId.equals(payment.getUserId()))
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public Optional<Payment> findById(String id) {
        return Optional.ofNullable(payments.get(id));
    }
    
    public List<Payment> findAll() {
        return new ArrayList<>(payments.values());
    }
}