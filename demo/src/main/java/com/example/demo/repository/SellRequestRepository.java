package com.example.demo.repository;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.model.SellRequest;
public interface SellRequestRepository extends MongoRepository<SellRequest, String> {
    List<SellRequest> findByResidentIdOrderByCreatedAtDesc(String residentId);
    List<SellRequest> findByStatusOrderByCreatedAtAsc(String status);
}