package com.example.demo.repository;


import com.example.demo.model.CollectionRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CollectionRecordRepository extends MongoRepository<CollectionRecord, String> {
    List<CollectionRecord> findByCollectorId(String collectorId);
    List<CollectionRecord> findByBinId(String binId);
}
