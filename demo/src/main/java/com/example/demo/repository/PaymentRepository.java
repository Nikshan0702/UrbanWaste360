package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Payment;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Payment> findByTransactionId(String transactionId);
    List<Payment> findByOrderId(String orderId);
}