package com.example.demo.service;


import com.example.demo.model.CollectionRecord;
import com.example.demo.repository.CollectionRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CollectionRecordService {

    private final CollectionRecordRepository collectionRecordRepository;

    @Autowired
    public CollectionRecordService(CollectionRecordRepository collectionRecordRepository) {
        this.collectionRecordRepository = collectionRecordRepository;
    }

    public List<CollectionRecord> getAllRecords() {
        return collectionRecordRepository.findAll();
    }

    public List<CollectionRecord> getRecordsByCollectorId(String collectorId) {
        return collectionRecordRepository.findByCollectorId(collectorId);
    }

    public List<CollectionRecord> getRecordsByBinId(String binId) {
        return collectionRecordRepository.findByBinId(binId);
    }

    public Optional<CollectionRecord> getRecordById(String id) {
        return collectionRecordRepository.findById(id);
    }
}
