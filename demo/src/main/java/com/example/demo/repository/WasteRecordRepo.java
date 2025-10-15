package com.example.demo.repository;

import com.example.demo.model.WasteRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface WasteRecordRepo extends MongoRepository<WasteRecord, String> {
    List<WasteRecord> findByResidentId(String residentId);
    List<WasteRecord> findByResidentIdAndType(String residentId, String type);

}
