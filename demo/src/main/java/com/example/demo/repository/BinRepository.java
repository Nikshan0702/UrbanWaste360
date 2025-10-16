package com.example.demo.repository;


import com.example.demo.model.Bin;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BinRepository extends MongoRepository<Bin, String> {
    Bin findByBinId(String binId);
    List<Bin> findByAssignedCollectorIdAndStatus(String collectorId, String status);
    List<Bin> findByAssignedCollectorId(String collectorId);
}
