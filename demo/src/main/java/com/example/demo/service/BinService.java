package com.example.demo.service;

import com.example.demo.model.Bin;
import com.example.demo.repository.BinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BinService {

    private final BinRepository binRepository;

    @Autowired
    public BinService(BinRepository binRepository) {
        this.binRepository = binRepository;
    }

    // Create a new Bin
    public Bin createBin(Bin bin) {
        return binRepository.save(bin);
    }

    // Get all bins
    public List<Bin> getAllBins() {
        return binRepository.findAll();
    }

    // Get a bin by its ID
    public Optional<Bin> getBinById(String id) {
        return binRepository.findById(id);
    }

    // Update an existing Bin
    public Bin updateBin(String id, Bin binDetails) {
        Optional<Bin> existingBin = binRepository.findById(id);
        if (existingBin.isPresent()) {
            Bin bin = existingBin.get();
            bin.setBinId(binDetails.getBinId());
            bin.setLocation(binDetails.getLocation());
            bin.setStatus(binDetails.getStatus());
            bin.setAssignedCollectorId(binDetails.getAssignedCollectorId());
            return binRepository.save(bin);
        }
        return null; // or handle bin not found
    }

    // Delete a Bin
    public boolean deleteBin(String id) {
        if (binRepository.existsById(id)) {
            binRepository.deleteById(id);
            return true;
        }
        return false; // or handle bin not found
    }
}
