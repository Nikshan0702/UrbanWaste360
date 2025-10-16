package com.example.demo.service;

import com.example.demo.model.Bin;
import com.example.demo.model.CollectionRecord;
import com.example.demo.repository.BinRepository;
import com.example.demo.repository.CollectionRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class CollectionService {

  private final BinRepository binRepository;
  private final CollectionRecordRepository recordRepository;

  public CollectionService(BinRepository binRepository,
                           CollectionRecordRepository recordRepository) {
    this.binRepository = binRepository;
    this.recordRepository = recordRepository;
  }

  public List<Bin> getBinsForCollector(String collectorId) {
    return binRepository.findByAssignedCollectorId(collectorId);
  }

  public Bin getBinById(String binId) {
    Bin bin = binRepository.findByBinId(binId);
    if (bin == null) throw new NoSuchElementException("Bin not found");
    return bin;
  }

  public List<Bin> getAllBins() {
    return binRepository.findAll();
  }

  @Transactional
  public Map<String, Object> recordCollection(String binId,
                                              String collectorId,
                                              String status,
                                              String remarks,
                                              String wasteType,
                                              String weightStr) {
    Bin bin = getBinById(binId);

    String normalizedWeight = null;
    if (weightStr != null && !weightStr.isBlank()) {
      try {
        normalizedWeight = new BigDecimal(weightStr).stripTrailingZeros().toPlainString();
      } catch (NumberFormatException ex) {
        throw new IllegalArgumentException("Invalid weight value");
      }
    }

    CollectionRecord record = new CollectionRecord();
    record.setBinId(binId);
    record.setCollectorId(collectorId);
    record.setStatus(status);
    record.setRemarks(remarks == null ? "" : remarks);
    record.setTimestamp(new Date());
    record.setWastetype(wasteType);
    record.setWeight(normalizedWeight);
    recordRepository.save(record);

    if (status != null &&
        (status.equalsIgnoreCase("Collected") || status.equalsIgnoreCase("Missed"))) {
      bin.setStatus(status);
      binRepository.save(bin);
    }

    return Map.of("message", "Collection recorded successfully");
  }

  @Transactional
  public List<Map<String, Object>> syncCollections(List<Map<String, String>> batch) {
    List<Map<String, Object>> results = new ArrayList<>();
    for (Map<String, String> item : batch) {
      try {
        recordCollection(
            item.get("binId"),
            item.get("collectorId"),
            item.get("status"),
            item.getOrDefault("remarks", ""),
            item.get("wasteType"),
            item.get("weight")
        );
        results.add(Map.of("binId", item.get("binId"), "status", "ok"));
      } catch (Exception e) {
        results.add(Map.of("binId", item.get("binId"),
                           "status", "error",
                           "msg", e.getMessage()));
      }
    }
    return results;
  }
}
