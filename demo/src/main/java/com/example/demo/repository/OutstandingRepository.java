package com.example.demo.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.model.Outstanding;

public interface OutstandingRepository extends MongoRepository<Outstanding, String> {
    // id = residentId
}