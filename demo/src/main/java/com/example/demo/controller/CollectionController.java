package com.example.demo.controller;

import com.example.demo.model.Bin;
import com.example.demo.service.CollectionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class CollectionController {

  private final CollectionService service;

  public CollectionController(CollectionService service) {
    this.service = service;
  }

  // ---- DTO kept inside controller so you only have 2 top-level files ----
  public static class CollectionRecordRequest {
    @NotBlank public String binId;
    @NotBlank public String collectorId;
    @NotBlank public String status;      // e.g., Collected / Missed / Reported-Damage
    @Size(max = 500) public String remarks;
    public String wasteType;             // e.g., Organic/Plastic/etc.
    @Pattern(regexp = "^$|^-?\\d+(\\.\\d+)?$", message = "Invalid weight value")
    public String weight;
  }

  @GetMapping("/collector/{collectorId}/bins")
  public ResponseEntity<List<Bin>> getBinsForCollector(@PathVariable String collectorId) {
    return ResponseEntity.ok(service.getBinsForCollector(collectorId));
  }

  @GetMapping("/bins/find/{binId}")
  public ResponseEntity<?> findByBinId(@PathVariable String binId) {
    try {
      return ResponseEntity.ok(service.getBinById(binId));
    } catch (NoSuchElementException ex) {
      return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
    }
  }

  @PostMapping("/collection/record")
  public ResponseEntity<?> recordCollection(@Valid @RequestBody CollectionRecordRequest req) {
    try {
      return ResponseEntity.ok(
          service.recordCollection(req.binId, req.collectorId, req.status,
                                   req.remarks, req.wasteType, req.weight));
    } catch (IllegalArgumentException ex) {
      return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    } catch (NoSuchElementException ex) {
      return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
    }
  }

  @PostMapping("/collection/sync")
  public ResponseEntity<List<Map<String, Object>>> syncCollections(
      @RequestBody List<Map<String, String>> payload) {
    return ResponseEntity.ok(service.syncCollections(payload));
  }

  @GetMapping("/bins")
  public ResponseEntity<List<Bin>> getAllBins() {
    return ResponseEntity.ok(service.getAllBins());
  }
}
