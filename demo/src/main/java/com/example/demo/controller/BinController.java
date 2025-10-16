package com.example.demo.controller;

import com.example.demo.model.Bin;
import com.example.demo.service.BinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/bins")
public class BinController {

    private final BinService binService;

    @Autowired
    public BinController(BinService binService) {
        this.binService = binService;
    }

    // Create a Bin
    @PostMapping
    public ResponseEntity<Bin> createBin(@RequestBody Bin bin) {
        Bin createdBin = binService.createBin(bin);
        return new ResponseEntity<>(createdBin, HttpStatus.CREATED);
    }

    // Get all bins
    @GetMapping
    public List<Bin> getAllBins() {
        return binService.getAllBins();
    }

    // Get a bin by ID
    @GetMapping("/{id}")
    public ResponseEntity<Bin> getBinById(@PathVariable String id) {
        Optional<Bin> bin = binService.getBinById(id);
        return bin.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update a Bin
    @PutMapping("/{id}")
    public ResponseEntity<Bin> updateBin(@PathVariable String id, @RequestBody Bin binDetails) {
        Bin updatedBin = binService.updateBin(id, binDetails);
        return updatedBin != null ? new ResponseEntity<>(updatedBin, HttpStatus.OK) : ResponseEntity.notFound().build();
    }

    // Delete a Bin
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBin(@PathVariable String id) {
        boolean isDeleted = binService.deleteBin(id);
        return isDeleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
