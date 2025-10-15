package com.example.demo.controller;

import com.example.demo.model.Bin;
import com.example.demo.model.CollectionRecord;
import com.example.demo.repository.BinRepository;
import com.example.demo.repository.CollectionRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class CollectionController {

    @Autowired
    private BinRepository binRepository;

    @Autowired
    private CollectionRecordRepository recordRepository;

    @GetMapping("/collector/{collectorId}/bins")
    public ResponseEntity<List<Bin>> getBinsForCollector(@PathVariable String collectorId) {
        List<Bin> bins = binRepository.findByAssignedCollectorId(collectorId);
        return ResponseEntity.ok(bins);
    }

    @GetMapping("/bins/find/{binId}")
    public ResponseEntity<?> findByBinId(@PathVariable String binId) {
        Bin bin = binRepository.findByBinId(binId);
        if (bin == null) return ResponseEntity.status(404).body(Map.of("error", "Bin not found"));
        return ResponseEntity.ok(bin);
    }

    @PostMapping("/collection/record")
    public ResponseEntity<?> recordCollection(@RequestBody Map<String, String> payload) {
        // Get values from payload
        String binId = payload.get("binId");
        String collectorId = payload.get("collectorId");
        String status = payload.get("status"); // Collected / Missed / Reported-Damage
        String remarks = payload.getOrDefault("remarks", "");
        String wasteType = payload.get("wasteType"); // Get waste type from payload
        String weightString = payload.get("weight"); // Get weight from payload
        String weight = null;

        // Parse weight as String, if valid
        if (weightString != null) {
            try {
                weight = String.valueOf(Double.parseDouble(weightString));
            } catch (NumberFormatException e) {
                return ResponseEntity.status(400).body(Map.of("error", "Invalid weight value"));
            }
        }

        // Retrieve bin from repository
        Bin bin = binRepository.findByBinId(binId);
        if (bin == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Bin not found"));
        }

        // Create a new collection record
        CollectionRecord record = new CollectionRecord();
        record.setBinId(binId);
        record.setCollectorId(collectorId);
        record.setStatus(status);
        record.setRemarks(remarks);
        record.setTimestamp(new Date());
        record.setWastetype(wasteType); // Set waste type from the request
        record.setWeight(weight); // Set weight as a String

        // Save collection record
        recordRepository.save(record);

        // Update bin status if necessary
        if ("Collected".equalsIgnoreCase(status) || "Missed".equalsIgnoreCase(status)) {
            bin.setStatus(status);
            binRepository.save(bin);
        }

        return ResponseEntity.ok(Map.of("message", "Collection recorded successfully"));
    }

    @PostMapping("/collection/sync")
    public ResponseEntity<?> syncCollections(@RequestBody List<Map<String, String>> payload) {
        List<Map<String, String>> results = new ArrayList<>();
        for (Map<String, String> item : payload) {
            try {
                recordCollection(item);
                results.add(Map.of("binId", item.get("binId"), "status", "ok"));
            } catch (Exception e) {
                results.add(Map.of("binId", item.get("binId"), "status", "error", "msg", e.getMessage()));
            }
        }
        return ResponseEntity.ok(results);
    }

    @GetMapping("/bins")
    public ResponseEntity<List<Bin>> getAllBins() {
        List<Bin> bins = binRepository.findAll();
        return ResponseEntity.ok(bins);
    }
}
