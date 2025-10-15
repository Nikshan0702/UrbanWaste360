package com.example.demo.controller;


import com.example.demo.model.CollectionRecord;
import com.example.demo.service.CollectionRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/collection-records")
public class CollectionRecordController {

    private final CollectionRecordService collectionRecordService;

    @Autowired
    public CollectionRecordController(CollectionRecordService collectionRecordService) {
        this.collectionRecordService = collectionRecordService;
    }

    @GetMapping
    public List<CollectionRecord> getAllRecords() {
        return collectionRecordService.getAllRecords();
    }

    @GetMapping("/collector/{collectorId}")
    public List<CollectionRecord> getRecordsByCollectorId(@PathVariable String collectorId) {
        return collectionRecordService.getRecordsByCollectorId(collectorId);
    }

    @GetMapping("/bin/{binId}")
    public List<CollectionRecord> getRecordsByBinId(@PathVariable String binId) {
        return collectionRecordService.getRecordsByBinId(binId);
    }

    @GetMapping("/{id}")
    public Optional<CollectionRecord> getRecordById(@PathVariable String id) {
        return collectionRecordService.getRecordById(id);
    }
}
