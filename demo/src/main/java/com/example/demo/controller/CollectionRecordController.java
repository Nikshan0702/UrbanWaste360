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

    @GetMapping("/bin/{binId}")
    public List<CollectionRecord> getRecordsByBinId(@PathVariable String binId) {
        return collectionRecordService.getRecordsByBinId(binId);
    }

    @GetMapping("/{id}")
    public Optional<CollectionRecord> getRecordById(@PathVariable String id) {
        return collectionRecordService.getRecordById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteRecord(@PathVariable String id) {
        boolean deleted = collectionRecordService.deleteRecordById(id);
        if (deleted) {
            return "Record deleted successfully.";
        } else {
            return "Record with ID not found.";
        }
    }
}


// Gajan